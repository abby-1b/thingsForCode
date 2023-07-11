/// <reference path="./peerHandler.ts" />

/** How long to wait between updates! */
const SYNC_INTERVAL = 1000
/** How much of a desync to accept */
const MAX_DESYNC_TIME = 3000

/** The actions that are sent between peers */
const enum Actions {
	GET_PARENT,
	PAUSE,
	PLAY,
}

type State = { paused: boolean, timeStamp: number }
type StateChangeFunction = (state: State) => undefined

class Interface {
	/** The peer handler */
	peer = new PeerHandler()

	/** Whether or not OUR player is currently paused */
	paused = true
	/** The current timestamp of OUR player, in milliseconds */
	timeStamp: number = 0

	/**
	 * Whether or not our timestamp is valid. It starts off as valid for the
	 * parent, but invalid for the child. After receiving and updating its state,
	 * the child's timestamp becomes valid, so the parent has to delay and wait
	 * for the child if it gets too far behind.
	 */
	timeStampValid = true

	isParent = true
	parentConn: number
	parentName: string

	stateChangeFunctions: StateChangeFunction[] = []

	constructor() {
		console.log("Our ID is:", this.peer.getId())

		this.peer.onConnection(connection => {
			// When a peer connects to us
			this.peer.onData(connection, data => {
				// When they send data,
				if (this.isParent) {
					// if we ARE the parent, handle that accordingly.
					this.parentGotData(data, connection)
				} else {
					// otherwise, we tell them the address of the actual parent.
					this.peer.sendToSingle(connection, { parent: this.parentConn })
				}
			})
			this.peer.onOpen(connection, () => {
				console.log("Opened!")
			})
		})

		// Start the state sending
		this.parentSendState()

		// Increment the time when we're not paused, regardless of parent or child
		setInterval(() => {
			if (!this.paused) this.timeStamp += 200
			console.log(this.timeStamp)
		}, 200)
	}

	/// PARENT THINGS ///

	parentGotData(data: unknown, connection: number) {
		if (!data) return
		if (data == Actions.GET_PARENT) {
			// We are the parent, so send undefined
			this.peer.sendToSingle(connection, { parent: undefined })
		} else if (data == Actions.PAUSE) {
			// Pause, as someone asked for it
			this.paused = true
			this.parentSendState(false)
			this.stateChanged()
		} else if (data == Actions.PLAY) {
			// Play, as someone asked for it
			this.paused = false
			this.parentSendState(false)
			this.stateChanged()
		} else if (typeof data === "object" && "behindTime" in data) {
			this.timeStamp = data.behindTime as number
		} else {
			console.log("Got data as parent:", data, "from", connection)
		}
	}

	parentSendState(startLoop = true) {
		if (!this.isParent) return
		this.peer.sendToChildren({
			paused: this.paused,
			timeStamp: this.timeStamp
		})

		// This is used instead of setInterval to pause when we're not the
		// parent anymore. This can be disabled (using `startLoop`) to call the
		// function immediately after a state change.
		if (startLoop) setTimeout(() => this.parentSendState(), SYNC_INTERVAL)
	}

	/// CHILD THINGS ///

	connectTo(parentName: string) {
		console.log("Switching to child!")

		// We're connecting to someone, immediately demoting us
		this.isParent = false
		this.timeStampValid = false

		// Connect to the peer
		this.peer.connectTo(parentName, connection => {
			this.parentConn = connection // Set the parent for now...
			this.parentName = parentName

			// Ask for the real parent
			this.peer.sendToSingle(connection, Actions.GET_PARENT)

			// Finally, prepare for receiving data
			this.peer.onData(connection, d => {
				this.childGotData(d, connection)
			})
		})
	}

	childGotData(data: unknown, connection: number) {
		if (!data) return

		if (typeof data === "object" && "parent" in data && data.parent) {
			// We're not connected to the real parent, so switch to this one
			this.connectTo(data.parent as string)
			return
		}

		if (typeof data === "object" && "paused" in data && "timeStamp" in data) {
			// Keep track of wether or not we changed the state
			let didChangeState = false

			if (this.paused != data.paused) {
				this.paused = data.paused as boolean
				didChangeState = true
			}

			if (!this.timeStampValid) {
				// Update our timestamp if it's invalid.
				this.timeStamp = data.timeStamp as number
				this.timeStampValid = true
				didChangeState = true
			} else {
				// If the timestamp is valid, we can complain about desync
				const desyncTime = this.timeStamp - (data.timeStamp as number)
				if (desyncTime < -MAX_DESYNC_TIME) {
					// We're too far behind, so ask the parent to wait
					this.peer.sendToSingle(this.parentConn, { behindTime: this.timeStamp })
				} else if (desyncTime > MAX_DESYNC_TIME) {
					// We're too far ahead, so adjust OUR time
					this.timeStamp -= desyncTime
					didChangeState = true
				}
			}

			if (didChangeState) this.stateChanged()

			return
		}

		console.log("Got data as child:", data)
	}

	/// GENERAL THINGS ///

	/** Pauses/plays */
	togglePause() {
		this.paused = !this.paused
		if (!this.isParent) {
			// If we're not the parent, tell the parent to pause
			this.peer.sendToSingle(this.parentConn, this.paused ? Actions.PAUSE : Actions.PLAY)
		} else {
			this.parentSendState(false)
		}
		this.stateChanged()
	}

	/** Runs a given function whenever the state changes. */
	onStateChange(fn: StateChangeFunction) {
		this.stateChangeFunctions.push(fn)
	}

	private stateChanged() {
		for (const fn of this.stateChangeFunctions) {
			fn({ paused: this.paused, timeStamp: this.timeStamp })
		}
	}
}

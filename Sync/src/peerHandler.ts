/// <reference path="./peer.d.ts" />

/**
 * This handles peers for us, which is great for testing, and eventually can be
 * switched out for a library other than PeerJS.
 */
class PeerHandler {
	private id = (1296 + Math.floor(Math.random() * 45359)).toString(36)
	private peer: Peer
	constructor(setupPeer = true) {
		if (setupPeer)
			this.peer = new Peer("video_sync_" + this.id)
	}

	getId(): string {
		return this.id
	}

	private connections: (Peer.DataConnection | undefined)[] = []

	/** Adds a connection to this peer's list */
	private addConnection(conn: Peer.DataConnection): number {
		// Try to find an empty spot
		for (let i = 0; i < this.connections.length; i++) {
			if (!this.connections[i]) {
				this.connections[i] = conn
				return i
			}
		}

		// If there are no empty spots, make a new one
		this.connections.push(conn)
		return this.connections.length - 1
	}

	/** Connects to a peer by name, returning the connection number */
	connectTo(peerName: string, fn: (conn: number) => undefined) {
		const conn = this.addConnection(this.peer.connect("video_sync_" + peerName))
		this.onOpen(conn, fn)
		return conn
	}

	/** Runs the given function when a new connection is initiated */
	onConnection(fn: (conn: number) => undefined) {
		this.peer.on("connection", conn => {
			fn(this.addConnection(conn))
		})
	}

	/**
	 * Runs the given function when a connection is opened
	 * @param fn A function that takes the data and connection number
	 */
	onOpen(conn: number, fn: (conn: number) => undefined) {
		this.connections[conn]?.on("open", () => {
			fn(conn)
		})
	}

	/**
	 * Runs the given function when data is received
	 * @param fn A function that takes the data and connection number
	 */
	onData(conn: number, fn: (data: unknown, conn: number) => undefined) {
		this.connections[conn]?.on("data", d => {
			fn(d, conn)
		})
	}

	/** Sends data to a single connection */
	sendToSingle(conn: number, data: unknown) {
		this.connections[conn]?.send(data)
	}

	/** Sends data to all children! */
	sendToChildren(data: unknown) {
		for (const c in this.connections) {
			this.connections[c]?.send(data)
		}
	}
}

/** This is used for testing! */
class OfflinePeerHandler extends PeerHandler {
	constructor() {
		super(false)
	}
}
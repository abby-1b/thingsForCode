use std::{ptr::NonNull, fmt::Debug};

struct LinkedList<T> {
	head: Option<NonNull<Node<T>>>,
	tail: Option<NonNull<Node<T>>>,
	length: usize
}

struct Node<T> {
	previous: Option<NonNull<Node<T>>>,
	next: Option<NonNull<Node<T>>>,
	data: T
}

impl<T> LinkedList<T> where T: Debug, T: Copy {
	pub fn init() -> LinkedList<T> {
		LinkedList {
			head: None,
			tail: None,
			length: 0
		}
	}

	pub fn print(&self) {
		let mut n = self.head;
		print!("[ ");
		for i in 0..self.length {
			unsafe {
				print!("{:?}", (*n.unwrap().as_ptr()).data);
				n = (*n.unwrap().as_ptr()).next;
			}
			if i != self.length - 1 {
				print!(", ");
			}
		}
		println!(" ]");
	}

	pub fn push(&mut self, item: T) {
		let mut node = Box::leak(Box::new(Node {
			previous: None,
			next: None,
			data: item
		}));

		if self.length == 0 {
			// Set the head & tail
			self.head = Some(node.into());
			self.tail = Some(node.into());
		} else {
			// Append to the tail
			node.previous = self.tail;
			unsafe {
				(*self.tail.unwrap().as_ptr()).next = Some(node.into());
			}
			self.tail = Some(node.into());
		}

		self.length += 1;
	}

	pub fn pop(&mut self) -> Option<T> {
		if self.length == 0 {
			return None;
		}

		let n: T;
		unsafe {
			n = (*self.tail.unwrap().as_ptr()).data;
			if self.length == 1 {
				self.head = None;
				self.tail = None;
			} else {
				self.tail = (*self.tail.unwrap().as_ptr()).previous;
			}
		}

		self.length -= 1;
		
		return Some(n);
	}

	pub fn shift(&mut self, item: T) {
		let mut node = Box::leak(Box::new(Node {
			previous: None,
			next: None,
			data: item
		}));

		if self.length == 0 {
			// Set the head & tail
			self.head = Some(node.into());
			self.tail = Some(node.into());
		} else {
			// Append to the head
			node.next = self.head;
			unsafe {
				(*self.head.unwrap().as_ptr()).previous = Some(node.into());
			}
			self.head = Some(node.into());
		}

		self.length += 1;
	}

	pub fn unshift(&mut self) -> Option<T> {
		if self.length == 0 {
			return None;
		}

		let n: T;
		unsafe {
			n = (*self.head.unwrap().as_ptr()).data;
			if self.length == 1 {
				self.head = None;
				self.tail = None;
			} else {
				self.head = (*self.head.unwrap().as_ptr()).next;
			}
		}

		self.length -= 1;
		
		return Some(n);
	}
}

fn main() {
	let mut l = LinkedList::init();

	l.push(123);
	l.push(456);
	l.push(789);
	l.shift(0);

	l.print();
	l.pop();
	l.print();
	l.unshift();
	l.print();
}

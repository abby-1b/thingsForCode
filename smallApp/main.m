#include <Cocoa/Cocoa.h>

// @interface MyWindowDelegate : NSObject <NSWindowDelegate>
// @end

// @implementation MyWindowDelegate
// - (void)windowDidBecomeKey:(NSNotification *)notification {
// 	NSWindow *window = [notification object];
// 	[window setBackgroundColor:[NSColor greenColor]];
// }
// @end

// int main(int argc, char *argv[]) {
// 	NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
// 	NSWindow *window = [
// 		[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, 200, 200)
// 		styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable
// 		backing:NSBackingStoreBuffered
// 		defer:NO
// 	];

// 	[window setTitle:@"NICE"];
// 	[window setDelegate:[[MyWindowDelegate alloc] init]];
// 	[window makeKeyAndOrderFront:nil];
// 	[[NSApplication sharedApplication] run];
// 	[pool release];
// 	return 0;
// }

int main(int argc, char *argv[]) {
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    NSWindow *window = [
		[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, 200, 200)
		styleMask: NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable
		backing: NSBackingStoreBuffered
		defer: NO
	];
    [window setTitle:@"Window Title"];
    [window makeKeyAndOrderFront:nil];
    [[NSApplication sharedApplication] run];
    [pool release];
    return 0;
}
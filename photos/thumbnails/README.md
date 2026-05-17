# Thumbnails

A thumbnail can be placed in **either** of two locations. The first match wins:

1. **Sibling to the photo, with a `.thumb` infix** — e.g. `photos/DSC03403.thumb.jpg`
   pairs with `photos/DSC03403.jpg`. The extension does not have to match the original.
2. **Inside this `photos/thumbnails/` folder**, using one of:
   - `DSC03403.thumb.jpg` (same `.thumb` convention)
   - `DSC03403.jpg` (same filename as the full image)

If no thumbnail is found, the full-resolution image is used (slower).

Any file whose name matches `*.thumb.*` is always treated as a thumbnail, never as a photo.

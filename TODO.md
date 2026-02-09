# TODO: Transform NewPlace into Full-Screen Wizard

- [x] Add state for current step (useState for step, set to 1-7)
- [x] Create progress bar component at top (shows (step/7)\*100% width)
- [x] Create navigation buttons (Back and Next/Save) at bottom
- [x] Implement handleNext and handleBack functions
- [x] Replace form layout with full-screen wizard structure
- [x] Step 1: Basic info (title, city) - centered content
- [x] Step 2: Photos (PhotosUploader) - full screen
- [x] Step 3: Description (MarkdownEditor) - full screen
- [x] Step 4: Amenities (Perks) - full screen
- [x] Step 5: Extra info (MarkdownEditor2) - full screen
- [x] Step 6: Price & capacity (price, guests, checkin, checkout) - full screen
- [x] Step 7: Final review (Preview component full-screen, with submit button)
- [x] Remove side preview from main layout; only in step 7
- [x] Keep edit mode logic (loading data via id)
- [x] Ensure responsive design (mobile-friendly)
- [x] Test navigation and submission
- [x] Move progress bar to bottom with border-t, split into 3 sections

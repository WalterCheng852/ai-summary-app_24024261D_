# 📸 Screenshot Checklist for Task 2 Documentation

## Section 6: Supabase Object Store

### Local Development Testing Screenshots

#### 6.1 Upload Functionality
- [ ] **Homepage with Hero Canvas** 
  - Show the 3D animated background with hero section
  - Location: `./screenshots/06-1-hero-page.png`
  - What to show: Full page view with title "AI Summary"

- [ ] **File Upload Interface - Drag & Drop**
  - Show the upload area with drag-and-drop interface
  - Location: `./screenshots/06-2-upload-interface.png`
  - What to show: Document uploader component with "揼個檔案入嚟" text

- [ ] **Upload Progress Indicator**
  - Show file uploading with progress bar (30-50% complete)
  - Location: `./screenshots/06-3-upload-progress.png`
  - What to show: Loading spinner with percentage

- [ ] **Successful Upload Message**
  - Show the green success notification after upload
  - Location: `./screenshots/06-4-upload-success.png`
  - What to show: Message "正！檔案上傳成功，而家可以生成摘要。"

#### 6.2 Supabase Storage Verification
- [ ] **Supabase Dashboard - Storage Bucket List**
  - Go to https://supabase.com/dashboard
  - Open your project → Storage
  - Show the "documents" bucket
  - Location: `./screenshots/06-5-supabase-buckets.png`
  - What to show: List of buckets with "documents" highlighted

- [ ] **Supabase Dashboard - Uploaded Files**
  - Click into "documents" bucket
  - Show file structure with uploaded PDFs/documents
  - Location: `./screenshots/06-6-supabase-files.png`
  - What to show: File listing like `{documentId}/original.pdf`

- [ ] **Supabase Dashboard - File Details**
  - Click on an uploaded file
  - Show file metadata and public URL
  - Location: `./screenshots/06-7-supabase-file-url.png`
  - What to show: File size, upload date, and public URL

#### 6.3 Database Records
- [ ] **Supabase PostgreSQL - Documents Table**
  - Go to Supabase Dashboard → SQL Editor
  - Run: `SELECT * FROM documents LIMIT 5;`
  - Show the records with columns: id, filename, file_type, file_url
  - Location: `./screenshots/06-8-db-documents-table.png`
  - What to show: Table with document records

---

## Section 7: AI Summary for Documents

### Summary Generation Testing

#### 7.1 Tone Selection
- [ ] **Tone Selection Interface**
  - Show the 4 tone buttons ready to select
  - Location: `./screenshots/07-1-tone-selection.png`
  - What to show: All 4 buttons: Professional, Casual, Concise, Detailed

- [ ] **Professional Tone Selected**
  - Show professional tone button highlighted/selected
  - Location: `./screenshots/07-2-tone-professional.png`
  - What to show: Button with white background, text selected

- [ ] **Generating Summary (Loading State)**
  - Show the "AI 諗緊點寫好..." message with spinning loader
  - Location: `./screenshots/07-3-generating-summary.png`
  - What to show: Loading spinner and progress text

#### 7.2 Summary Results
- [ ] **Generated Summary - Professional**
  - Show a generated summary in professional tone
  - Location: `./screenshots/07-4-summary-professional.png`
  - What to show: Complete summary text displayed

- [ ] **Generated Summary - Casual**
  - Generate and show the same document in casual tone
  - Location: `./screenshots/07-5-summary-casual.png`
  - What to show: Summary with friendly, conversational tone

- [ ] **Generated Summary - Concise**
  - Show concise version (bullet points style)
  - Location: `./screenshots/07-6-summary-concise.png`
  - What to show: Condensed summary with key points

#### 7.3 Summary Data in Database
- [ ] **Supabase PostgreSQL - Summaries Table**
  - Go to SQL Editor
  - Run: `SELECT id, document_id, tone, regeneration_count FROM summaries LIMIT 5;`
  - Location: `./screenshots/07-7-db-summaries-table.png`
  - What to show: Summary records with metadata

---

## Section 8: Database Integration

#### 8.1 Database Schema
- [ ] **Documents Table Structure**
  - Go to Supabase → Table Editor → documents
  - Show the table with all columns
  - Location: `./screenshots/08-1-table-documents-schema.png`
  - What to show: Columns: id, filename, file_type, raw_text, file_url, created_at, updated_at

- [ ] **Summaries Table Structure**
  - Go to Supabase → Table Editor → summaries
  - Show the table with all columns
  - Location: `./screenshots/08-2-table-summaries-schema.png`
  - What to show: Columns: id, document_id, generated_summary, edited_summary, tone, regeneration_count, created_at, updated_at

#### 8.2 Data Examples
- [ ] **Sample Document Record**
  - Query and display a document record with all details
  - Location: `./screenshots/08-3-sample-document-record.png`
  - What to show: Full row with filename, file_url, timestamps

- [ ] **Sample Summary Record**
  - Query and display a summary record
  - Location: `./screenshots/08-4-sample-summary-record.png`
  - What to show: Generated and edited summaries, tone, regen count

- [ ] **Multiple Summaries for One Document**
  - Show a document with 2-3 summaries in different tones
  - Location: `./screenshots/08-5-multiple-summaries.png`
  - What to show: One document_id with multiple summary records

---

## Section 9: Advanced Features

#### 9.1 Smart Session Management (New Session Button)
- [ ] **Summary View with New Session Button**
  - Show a completed summary with all action buttons
  - Focus on the "開始新工作" button on the right
  - Location: `./screenshots/09-1-new-session-button.png`
  - What to show: Buttons: "編輯內容", "重新生成", "複製", and "開始新工作"

- [ ] **After Clicking New Session**
  - Show the reset state returning to upload interface
  - Location: `./screenshots/09-2-after-new-session.png`
  - What to show: Empty upload area ready for new document

#### 9.2 3D Hero Canvas Animation
- [ ] **Hero Canvas - Initial State**
  - Show the 3D animated background at page load
  - Location: `./screenshots/09-3-hero-canvas-initial.png`
  - What to show: Animated sphere and particles in background

- [ ] **Hero Canvas - Multiple Angles** (Optional)
  - Capture at different scroll positions
  - Location: `./screenshots/09-4-hero-canvas-scrolled.png`
  - What to show: How 3D background responds to scroll

#### 9.3 Advanced Editor with AI Rephrase
- [ ] **Editor Interface - Text Selection**
  - Show the side-by-side editor and preview
  - Select some text to trigger the toolbar
  - Location: `./screenshots/09-5-editor-text-selection.png`
  - What to show: Text selected with toolbar above it

- [ ] **Editor - Text Selection Toolbar**
  - Show the floating toolbar with format buttons
  - Buttons: Bold, Italic, Underline, AI Rephrase
  - Location: `./screenshots/09-6-editor-toolbar.png`
  - What to show: Toolbar with 4 buttons clearly visible

- [ ] **Editor - Rephrase Menu**
  - Click "AI Rephrase" to show the submenu
  - Location: `./screenshots/09-7-rephrase-menu.png`
  - What to show: 3 options: 簡化, 專業, 隨意

- [ ] **Editor - Side-by-Side Preview**
  - Show the full editor with live preview on right
  - Location: `./screenshots/09-8-editor-fullscreen.png`
  - What to show: Both editor and preview pane with text synchronized

- [ ] **Editor - Character Count**
  - Show the word/character counter in preview section
  - Location: `./screenshots/09-9-editor-char-count.png`
  - What to show: "實時預覽 · {count} 字" display

#### 9.4 Document History Sidebar
- [ ] **History Panel - Document List**
  - Show the left sidebar with history section
  - Location: `./screenshots/09-10-history-panel.png`
  - What to show: List of previously uploaded documents

- [ ] **History - Click Document**
  - Show document selection from history
  - Location: `./screenshots/09-11-history-select.png`
  - What to show: Highlighted selected document with its summary

#### 9.5 Mobile Responsiveness
- [ ] **Mobile View - Homepage** (Use DevTools to simulate)
  - Set viewport to iPhone 12 (390px)
  - Show hero section on mobile
  - Location: `./screenshots/09-12-mobile-home.png`
  - What to show: Mobile layout with responsive design

- [ ] **Mobile View - Upload Interface**
  - Show upload interface on narrow screen
  - Location: `./screenshots/09-13-mobile-upload.png`
  - What to show: Stacked layout on mobile

- [ ] **Mobile View - Summary Editing**
  - Show editor on mobile (may show single column)
  - Location: `./screenshots/09-14-mobile-editor.png`
  - What to show: Editor adapted to mobile screen

- [ ] **Mobile View - Action Buttons**
  - Show buttons properly sized and spaced
  - Location: `./screenshots/09-15-mobile-buttons.png`
  - What to show: Touch-friendly button sizing

---

## Vercel Deployment Screenshots

#### 10.1 Deployment Process
- [ ] **Vercel Dashboard - Project Connected**
  - Go to https://vercel.com/dashboard
  - Show your project listed
  - Location: `./screenshots/10-1-vercel-project.png`
  - What to show: Project name and deployment status

- [ ] **Vercel - Latest Deployment**
  - Show the deployment details page
  - Location: `./screenshots/10-2-vercel-deployment.png`
  - What to show: Deployment URL and status (green checkmark)

- [ ] **Vercel - Environment Variables**
  - Go to Settings → Environment Variables
  - Show variables are configured (blur sensitive values if needed)
  - Location: `./screenshots/10-3-vercel-env-vars.png`
  - What to show: Environment variables configured correctly

#### 10.2 Production Testing
- [ ] **Deployed App - Upload on Production**
  - Open your Vercel URL in browser
  - Upload a test document
  - Location: `./screenshots/10-4-prod-upload.png`
  - What to show: Upload working on production

- [ ] **Deployed App - Generated Summary**
  - Show summary generation on production URL
  - Location: `./screenshots/10-5-prod-summary.png`
  - What to show: Summary generated successfully on live app

- [ ] **Deployed App - Full Page**
  - Show complete page on production
  - Location: `./screenshots/10-6-prod-fullpage.png`
  - What to show: Entire app interface on Vercel URL

---

## Additional Evidence

#### 11.1 Browser Console & Logs
- [ ] **Console Logs - Successful Upload**
  - Open DevTools → Console
  - Upload a file and show success logs
  - Location: `./screenshots/11-1-console-upload.png`
  - What to show: "✅ 檔案上傳成功" or success messages

- [ ] **Console Logs - API Calls**
  - Show Network tab with API calls
  - Location: `./screenshots/11-2-network-api.png`
  - What to show: POST /api/upload, /api/summarize requests with 200 status

#### 11.2 Git Commits
- [ ] **GitHub Commit History**
  - Go to your GitHub repo
  - Show recent commits
  - Location: `./screenshots/11-3-github-commits.png`
  - What to show: Regular commits with descriptive messages

---

## Suggested Capture Order (Efficient)

**Step 1: Local Testing (30 mins)**
1. Start app with `npm run dev`
2. Capture 06-1, 06-2, 06-3, 06-4 (upload flow)
3. Capture 07-1, 07-2, 07-3, 07-4, 07-5, 07-6 (summary generation)
4. Capture 09-1, 09-2, 09-3 (new features)
5. Capture 09-5, 09-6, 09-7, 09-8, 09-9 (editor features)
6. Capture 09-10, 09-11 (history)
7. Capture 09-12 to 09-15 (mobile - use DevTools)

**Step 2: Database Verification (15 mins)**
1. Open Supabase Dashboard
2. Capture 06-5, 06-6, 06-7, 06-8 (storage)
3. Capture 08-1, 08-2, 08-3, 08-4, 08-5 (database)
4. Capture 07-7 (summaries table)

**Step 3: Vercel Deployment (10 mins)**
1. Open Vercel Dashboard
2. Capture 10-1, 10-2, 10-3
3. Test live URL and capture 10-4, 10-5, 10-6

**Step 4: Polish (10 mins)**
1. Browser console - capture 11-1, 11-2
2. GitHub - capture 11-3

---

## Total Screenshots Needed: ~43

**Minimum Essential Set (20-25 screenshots):**
- 06-2, 06-4 (upload)
- 06-6 (storage files)
- 06-8 (documents table)
- 07-1, 07-4, 07-5, 07-6 (summary tones)
- 07-7 (summaries table)
- 08-1, 08-2 (schema)
- 08-3, 08-4 (sample data)
- 09-1 (new session button)
- 09-5, 09-6, 09-7 (editor)
- 09-12 (mobile)
- 10-2, 10-4, 10-5 (production)
- 11-3 (github commits)

**Estimated Total Time:** 60-90 minutes

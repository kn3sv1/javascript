// Small browser script for the admin "page" form.
// 1. Turns the "content" textarea into CKEditor.
// 2. Shows a preview of the selected main image.

// ---------- CKEditor ----------

const contentTextarea = document.querySelector("#content");

if (contentTextarea && window.CKEDITOR) {
  // CKEDITOR is a global variable created by /vendor/ckeditor5/ckeditor5.umd.js
  const {
    ClassicEditor,
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Link,
    List,
    BlockQuote,
    Table,
    TableToolbar,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageResize,
    ImageUpload,
    ImageInsert,
    SimpleUploadAdapter,
    SourceEditing,
    GeneralHtmlSupport,
    HtmlComment,
    HtmlEmbed,
  } = window.CKEDITOR;

  // When the form is submitted, CKEditor automatically copies its HTML
  // back into the textarea, so the server receives it as "content".
  ClassicEditor.create(contentTextarea, {
    licenseKey: "GPL",
    plugins: [
      Essentials, Paragraph, Heading, Bold, Italic, Underline, Link, List, BlockQuote,
      Table, TableToolbar,
      Image, ImageCaption, ImageStyle, ImageToolbar, ImageResize, ImageUpload, ImageInsert,
      SimpleUploadAdapter, SourceEditing,
      GeneralHtmlSupport, HtmlComment, HtmlEmbed,
    ],
    toolbar: [
      "undo", "redo", "|",
      "heading", "|",
      "bold", "italic", "underline", "link", "|",
      "bulletedList", "numberedList", "blockQuote", "|",
      "insertImage", "insertTable", "htmlEmbed", "|",
      "sourceEditing",
    ],
    // Keep ANY HTML: all tags, attributes, classes and inline styles.
    // Without this, CKEditor removes HTML it does not know (e.g. <div class="...">).
    htmlSupport: {
      allow: [
        {
          name: /.*/,
          attributes: true,
          classes: true,
          styles: true,
        },
      ],
    },
    // "Insert HTML" button: a block of raw HTML that is saved exactly as typed.
    htmlEmbed: {
      showPreviews: false,
    },
    image: {
      toolbar: ["imageStyle:inline", "imageStyle:block", "imageStyle:side", "|", "toggleImageCaption", "imageTextAlternative"],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    // Images uploaded inside the editor are saved to uploads/pages/
    simpleUpload: {
      uploadUrl: "/admin/uploads/editor",
    },
  }).catch((error) => {
    console.error("CKEditor could not start:", error);
  });
}

// ---------- Main image preview ----------

const mainImageSelect = document.querySelector("#mainImage");
const mainImagePreview = document.querySelector("#mainImagePreview");

if (mainImageSelect && mainImagePreview) {
  mainImageSelect.addEventListener("change", () => {
    if (mainImageSelect.value) {
      mainImagePreview.src = "/uploads/" + mainImageSelect.value;
      mainImagePreview.hidden = false;
    } else {
      mainImagePreview.hidden = true;
    }
  });
}

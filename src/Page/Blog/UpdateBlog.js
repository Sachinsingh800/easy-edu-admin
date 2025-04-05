import React, { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import axios from "axios";
import styles from "./UpdateBlog.module.css";
import { useNavigate, useParams } from "react-router-dom";

function UpdateBlog() {
  const [content, setContent] = useState("");
  const [blogName, setBlogName] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [pdfLink, setPdfLink] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const editor = useRef(null);
  const fileInputRef = useRef(null);
  const { link } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await fetch(
          `https://lmsapp-plvj.onrender.com/admin/blog/get/${link}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog details');
        }
        
        const data = await response.json();
        
        if (data.status) {
          setBlogData(data.data);
        } else {
          throw new Error(data.message || 'Blog not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [link]);

  useEffect(() => {
    if (blogData) {
      setBlogName(blogData.blogName);
      setTitle(blogData.title);
      setSubtitle(blogData.subtitle);
      setAuthor(blogData.authorName);
      setContent(blogData.mixContent);
      setPdfLink(blogData.pdfLink);
      setCustomLink(blogData.customLink);
    }
  }, [blogData]);

  const config = {
    readonly: false,
    height: 500,
    toolbarAdaptive: true,
    toolbarButtonSize: "medium",
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_clear_html",
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "brush",
      "|",
      "align",
      "outdent",
      "indent",
      "|",
      "image",
      "link",
      "table",
      "|",
      "undo",
      "redo",
      "|",
      "preview",
      "fullsize",
    ],
    table: {
      styles: {
        "border-collapse": "collapse",
      },
      defaultStyle: "border: 1px solid #ddd; padding: 8px;",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Njk4M2VhODQ5OTRlMDllNTJjMWIxYyIsImlhdCI6MTczNDk2ODQxNX0.0mxzxb4WBh_GAWHfyfMudWl5cPn6thbigI8VH_AFV8A";

    if (!token) {
      alert("Authorization token missing");
      return;
    }

    const formData = new FormData();
    formData.append("blogName", blogName);
    formData.append("authorName", author);
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("mixContent", content);
    formData.append("pdfLink", pdfLink);
    formData.append("customLink", customLink);

    if (featuredImage) {
      formData.append("featureImage", featuredImage, featuredImage.name);
    }

    axios
      .put(
        `https://lmsapp-plvj.onrender.com/admin/blog/update/${blogData._id}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        console.log("Blog updated successfully:", response.data);
        alert("Blog updated successfully!");
        navigate(-1);
      })
      .catch((error) => {
        console.error("Error updating blog:", error);
        alert("Error updating blog. Please try again.");
      });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.blogEditorContainer}>
      <form onSubmit={handleSubmit} className={styles.blogForm}>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={blogName}
            onChange={(e) => setBlogName(e.target.value)}
            placeholder="Blog Name"
            className={styles.titleInput}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog Title"
            className={styles.titleInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Blog Subtitle"
            className={styles.subtitleInput}
          />
        </div>

        <div className={styles.formGroup}>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author Name"
            className={styles.subtitleInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <input
            type="text"
            value={pdfLink}
            onChange={(e) => setPdfLink(e.target.value)}
            placeholder="PDF Link"
            className={styles.subtitleInput}
          />
        </div>

        <div className={styles.formGroup}>
          <input
            type="text"
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
            placeholder="Custom Link"
            className={styles.subtitleInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.imageUploadLabel}>
            Upload Featured Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.imageUploadInput}
              ref={fileInputRef}
            />
          </label>
          {(featuredImage || blogData?.featureImage?.url) && (
            <div className={styles.imagePreview}>
              <img
                src={
                  featuredImage 
                    ? URL.createObjectURL(featuredImage) 
                    : blogData.featureImage.url
                }
                alt="Featured preview"
              />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onBlur={(newContent) => setContent(newContent)}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.previewButton}
            onClick={() => setShowPreview(true)}
          >
            Preview Blog
          </button>
          <button type="submit" className={styles.submitButton}>
            Update Blog
          </button>
        </div>
      </form>

      {showPreview && (
        <div className={styles.previewOverlay}>
          <div className={styles.previewContent}>
            <button
              className={styles.closePreview}
              onClick={() => setShowPreview(false)}
            >
              &times;
            </button>
            <h1 className={styles.previewTitle}>{title}</h1>
            {subtitle && <h2 className={styles.previewSubtitle}>{subtitle}</h2>}
            {author && <h4 className={styles.previewAuthor}>{author}</h4>}
            {(featuredImage || blogData?.featureImage?.url) && (
              <div className={styles.previewFeaturedImage}>
                <img
                  src={
                    featuredImage 
                      ? URL.createObjectURL(featuredImage) 
                      : blogData.featureImage.url
                  }
                  alt="Featured preview"
                />
              </div>
            )}
            <div
              className={styles.previewBody}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateBlog;
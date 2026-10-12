---
"@kappa-ui/registry": minor
---

FileUpload's parts follow its `size` through CSS variables on the root instead of reading it from the context: `--file-upload-gap`, `--file-upload-padding`, `--file-upload-control`, `--file-upload-icon`, `--file-upload-remove-icon`, and `--file-upload-title`, `--file-upload-description` and `--file-upload-name` with their `-leading` twins. A class on a part now wins over its size, and one variable on the root retunes every part. Nothing moves by a pixel. The size-free styles are plain strings now: `fileUploadIcon`, `fileUploadTitle`, `fileUploadDescription`, `fileUploadItemName` and `fileUploadRemoveOverlay` replace the `…Variants` functions, and the dropzone, list, item and preview variants lost their `size` key.

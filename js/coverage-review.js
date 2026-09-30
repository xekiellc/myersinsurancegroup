/* ============================================
   MYERS INSURANCE GROUP — coverage-review.js
   ============================================ */

(function () {

  const form = document.getElementById('reviewForm');
  const successMsg = document.getElementById('reviewSuccess');
  const submitBtn = document.getElementById('reviewSubmitBtn');
  const uploadZone = document.getElementById('uploadZone');
  const uploadInput = document.getElementById('decFiles');
  const uploadZoneInner = document.getElementById('uploadZoneInner');
  const fileList = document.getElementById('uploadFileList');

  if (!form) return;

  /* ── FILE MANAGEMENT ── */
  let selectedFiles = [];

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getFileIcon(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'ti-file-type-pdf';
    if (['jpg', 'jpeg', 'png', 'heic', 'webp'].includes(ext)) return 'ti-photo';
    return 'ti-file';
  }

  function renderFileList() {
    fileList.innerHTML = '';

    if (selectedFiles.length === 0) {
      uploadZone.classList.remove('has-files');
      uploadZoneInner.style.display = 'flex';
      return;
    }

    uploadZone.classList.add('has-files');
    uploadZoneInner.style.display = 'none';

    selectedFiles.forEach(function (file, index) {
      const li = document.createElement('li');
      li.className = 'upload-file-item';
      li.innerHTML = `
        <i class="ti ${getFileIcon(file)}"></i>
        <span class="upload-file-name" title="${file.name}">${file.name}</span>
        <span class="upload-file-size">${formatFileSize(file.size)}</span>
        <button type="button" class="upload-file-remove" aria-label="Remove ${file.name}" data-index="${index}">
          <i class="ti ti-x"></i>
        </button>
      `;
      fileList.appendChild(li);
    });

    /* Remove buttons */
    fileList.querySelectorAll('.upload-file-remove').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'));
        selectedFiles.splice(idx, 1);
        renderFileList();
      });
    });
  }

  function addFiles(newFiles) {
    const maxFiles = 10;
    const maxTotal = 15 * 1024 * 1024; /* 15MB total per submission */
    const allowed = ['pdf', 'jpg', 'jpeg', 'png', 'heic', 'webp'];

    Array.from(newFiles).forEach(function (file) {
      const ext = file.name.split('.').pop().toLowerCase();

      if (!allowed.includes(ext)) {
        showUploadError('File type not supported: ' + file.name + '. Please use PDF, JPG, PNG, or HEIC.');
        return;
      }

      const currentTotal = selectedFiles.reduce(function (sum, f) { return sum + f.size; }, 0);
      if (currentTotal + file.size > maxTotal) {
        showUploadError(file.name + ' would put you over the 15 MB total limit. Try a smaller file or a screenshot of the dec page.');
        return;
      }

      if (selectedFiles.length >= maxFiles) {
        showUploadError('Maximum 10 files allowed.');
        return;
      }

      /* Avoid duplicates */
      const isDuplicate = selectedFiles.some(function (f) {
        return f.name === file.name && f.size === file.size;
      });

      if (!isDuplicate) {
        selectedFiles.push(file);
      }
    });

    renderFileList();
    clearUploadError();
  }

  function showUploadError(msg) {
    clearUploadError();
    const err = document.createElement('p');
    err.className = 'field-error-msg upload-error';
    err.textContent = msg;
    uploadZone.insertAdjacentElement('afterend', err);
  }

  function clearUploadError() {
    const existing = document.querySelector('.upload-error');
    if (existing) existing.remove();
  }

  /* ── FILE INPUT CHANGE ── */
  if (uploadInput) {
    uploadInput.addEventListener('change', function () {
      if (typeof gtag === 'function' && uploadInput.files.length) {
        gtag('event', 'dec_page_upload', {
          event_category: 'engagement',
          event_label: 'file_selected',
          value: uploadInput.files.length
        });
      }
      addFiles(uploadInput.files);
      /* Reset input so same file can be re-added after remove */
      uploadInput.value = '';
    });
  }

  /* ── DRAG AND DROP ── */
  if (uploadZone) {
    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', function (e) {
      if (!uploadZone.contains(e.relatedTarget)) {
        uploadZone.classList.remove('drag-over');
      }
    });

    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    });
  }

  /* ── FIELD VALIDATION ── */
  function validateField(field) {
    const val = field.value.trim();
    let valid = true;

    removeFieldError(field);

    if (field.hasAttribute('required') && !val) {
      showFieldError(field, 'This field is required.');
      valid = false;
    } else if (field.type === 'email' && val) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(val)) {
        showFieldError(field, 'Please enter a valid email address.');
        valid = false;
      }
    }

    return valid;
  }

  function showFieldError(field, msg) {
    field.classList.add('field-error');
    const err = document.createElement('p');
    err.className = 'field-error-msg';
    err.textContent = msg;
    field.parentNode.appendChild(err);
  }

  function removeFieldError(field) {
    field.classList.remove('field-error');
    const existing = field.parentNode.querySelector('.field-error-msg');
    if (existing) existing.remove();
  }

  /* ── VALIDATE ON BLUR ── */
  form.querySelectorAll('.field-input').forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });
    field.addEventListener('input', function () {
      if (field.classList.contains('field-error')) {
        validateField(field);
      }
    });
  });

  /* ── FORM SUBMIT ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Check for placeholder Formspree ID */
    const action = form.getAttribute('action') || '';
    if (action.includes('REPLACE_WITH')) {
      showComingSoon();
      return;
    }

    /* Validate fields */
    let allValid = true;
    form.querySelectorAll('.field-input').forEach(function (field) {
      if (!validateField(field)) allValid = false;
    });

    /* Validate file upload */
    if (selectedFiles.length === 0) {
      showUploadError('Please upload at least one dec page.');
      allValid = false;
    }

    if (!allValid) {
      const firstError = form.querySelector('.field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    /* Build FormData with selected files */
    const formData = new FormData(form);

    /* Remove the file input's empty value and add actual files */
    formData.delete('dec_pages');
    selectedFiles.forEach(function (file) {
      formData.append('dec_pages', file, file.name);
    });

    /* Disable submit */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        showSuccess();
        trackReviewSubmit();
      } else {
        return res.json()
          .catch(function () { return {}; })
          .then(function (data) {
            const err = new Error(data.error || 'Submission failed.');
            err.fromServer = Boolean(data.error);
            throw err;
          });
      }
    })
    .catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit for free review →';
      showFormError(err && err.fromServer
        ? err.message
        : 'Something went wrong. Please try again or reach out on Facebook.');
      console.error('Review form error:', err);
    });

  });

  /* ── SUCCESS ── */
  function showSuccess() {
    form.style.display = 'none';
    if (successMsg) {
      successMsg.removeAttribute('hidden');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ── COMING SOON ── */
  function showComingSoon() {
    const existing = document.querySelector('.coming-soon-msg');
    if (existing) {
      existing.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const msg = document.createElement('div');
    msg.className = 'coming-soon-msg';
    msg.innerHTML = `
      <i class="ti ti-clock"></i>
      <p><strong>Coverage review portal coming soon.</strong> In the meantime, send your dec pages directly via <a href="https://www.facebook.com/ZMInsuranceGroup" target="_blank" rel="noopener">Facebook Messenger</a> and we'll review them personally.</p>
    `;
    form.insertAdjacentElement('beforebegin', msg);
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── FORM ERROR ── */
  function showFormError(msg) {
    const existing = document.querySelector('.form-submit-error');
    if (existing) existing.remove();
    const err = document.createElement('p');
    err.className = 'form-submit-error';
    err.textContent = msg;
    submitBtn.insertAdjacentElement('afterend', err);
  }

  /* ── GA4 TRACKING ── */
  function trackReviewSubmit() {
    if (typeof gtag === 'function') {
      gtag('event', 'coverage_review_submit', {
        event_category: 'conversion',
        event_label: 'coverage_review_form',
        value: selectedFiles.length
      });
    }
  }

})();

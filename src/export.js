/* ==========================================================================
   AI-POWERED SMART AGRICULTURE - VIDEO EXPORT CONTROLLER
   ========================================================================== */

export class VideoExportManager {
  constructor(uiElements) {
    this.ui = uiElements;
    this.initExportModal();
  }

  initExportModal() {
    if (!this.ui.btnExport) return;

    this.ui.btnExport.addEventListener('click', () => {
      this.openModal();
    });

    if (this.ui.modalClose) {
      this.ui.modalClose.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.ui.modalBackdrop) {
      this.ui.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.ui.modalBackdrop) {
          this.closeModal();
        }
      });
    }
  }

  openModal() {
    if (this.ui.modalBackdrop) {
      this.ui.modalBackdrop.classList.add('open');
    }
  }

  closeModal() {
    if (this.ui.modalBackdrop) {
      this.ui.modalBackdrop.classList.remove('open');
    }
  }
}

class ToastService {
  constructor() {
    this.toast = null;
  }

  setToastInstance(toastInstance) {
    this.toast = toastInstance;
  }

  success(message, duration = 3) {
    if (this.toast) {
      this.toast.success(message, duration);
    } else {
      console.warn('Toast instance not initialized');
    }
  }

  error(message, duration = 3) {
    if (this.toast) {
      this.toast.error(message, duration);
    } else {
      console.warn('Toast instance not initialized');
    }
  }

  warning(message, duration = 3) {
    if (this.toast) {
      this.toast.warning(message, duration);
    } else {
      console.warn('Toast instance not initialized');
    }
  }

  info(message, duration = 3) {
    if (this.toast) {
      this.toast.info(message, duration);
    } else {
      console.warn('Toast instance not initialized');
    }
  }
}

export default new ToastService();
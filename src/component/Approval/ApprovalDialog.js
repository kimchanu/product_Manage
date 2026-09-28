import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export default function ApprovalDialog({ title, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className={`ap-dialog ${wide ? 'ap-dialog-wide' : ''}`} aria-label={title}
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="ap-dialog-heading"><h2>{title}</h2><button type="button" className="ap-icon" title="닫기" aria-label="닫기" onClick={onClose}><FiX /></button></div>
    {children}
  </dialog>;
}

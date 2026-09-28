import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import './WorkspaceDialog.css';

export default function WorkspaceDialog({ title, onClose, children, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="ws-dialog" aria-label={title} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><h2>{title}</h2><button type="button" title="닫기" aria-label="닫기" onClick={onClose} disabled={busy}><FiX /></button></header>
    <div className="ws-dialog-body">{children}</div>
  </dialog>;
}

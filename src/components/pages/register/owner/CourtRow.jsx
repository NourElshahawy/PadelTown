export default function CourtRow({ court, index, onChange, onRemove, canRemove }) {
  return (
    <div className="court-row">
      <div className="court-row-header">
        <h4>ملعب {index + 1}</h4>
        {canRemove && (
          <button type="button" className="btn-remove-court" onClick={onRemove}>
            <i className="fa-solid fa-trash" style={{ fontSize: 16 }}></i> إزالة
          </button>
        )}
      </div>

      <div className="row g-3">
        <div className="col-12">
          <div className="field-group mb-0">
            <label>اسم الملعب</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-table-tennis-paddle-ball field-icon"></i>
              <input className="field-input" type="text" placeholder={`مثال: ملعب ${index + 1}`} value={court.name} onChange={(e) => onChange({ ...court, name: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="field-group mb-0">
            <label>نوع الملعب</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-layer-group field-icon"></i>
              <select className="field-input" value={court.type} onChange={(e) => onChange({ ...court, type: e.target.value })}>
                <option value="regular">عادي</option>
                <option value="panoramic">بانوراما</option>
                <option value="indoor">مغطى</option>
                <option value="outdoor">مكشوف</option>
              </select>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="field-group mb-0">
            <label>السعر / ساعة (جنيه)</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-credit-card field-icon"></i>
              <input className="field-input" type="number" placeholder="مثال: 150" min="50" max="1000" value={court.price} onChange={(e) => onChange({ ...court, price: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

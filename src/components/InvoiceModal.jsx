import { X } from "lucide-react"

const InvoiceModal = ({ txn, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full">
      <div className="border-b px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-dark">Payment Invoice</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
      </div>
      <div className="p-6 space-y-4">
        <div><b>Reference ID:</b> <span>{txn.payment_reference_id}</span></div>
        <div>
          <b>Payment Screenshot:</b>
          <a href={txn.payment_proof_url} target="_blank" rel="noopener noreferrer" className="block mt-1 text-blue-600 underline whitespace-nowrap max-w-[350px] truncate">
            {txn.payment_proof_url}
          </a>
        </div>
        {txn.payment_notes && (
          <div><b>Notes:</b> <span>{txn.payment_notes}</span></div>
        )}
      </div>
      <div className="flex justify-end px-6 pb-4">
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
)
export default InvoiceModal

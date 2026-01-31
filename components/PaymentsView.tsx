
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Building2, 
  History, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Loader2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Download
} from 'lucide-react';
import { AuthUser, PaymentTransaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Signature } from './Signature';
import { db } from '../utils/persistence';

interface PaymentsViewProps {
  user: AuthUser;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ user }) => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'Telebirr' | 'CBE' | null>(null);
  const [amount, setAmount] = useState('');
  const [identifier, setIdentifier] = useState(''); // Phone or Account
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadedTxs = db.getPayments();
    setTransactions(loadedTxs);
    calculateBalance(loadedTxs);
  }, []);

  const calculateBalance = (txs: PaymentTransaction[]) => {
    const credit = txs.filter(t => t.type === 'Credit' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
    const debit = txs.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0);
    // Assuming initial tuition obligation is covered by debits, balance is what remains to be paid
    // Or simpler logic: Credit - Debit = Net Balance (Negative implies debt/outstanding)
    // For School fees: Outstanding Balance = Total Fees (Debit) - Total Paid (Credit)
    setBalance(debit - credit);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !amount || !identifier) return;

    setProcessing(true);

    // Simulate API Call
    setTimeout(() => {
      const payAmount = parseFloat(amount);
      const newTx: PaymentTransaction = {
        id: `tx${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Payment via ${selectedMethod}`,
        amount: payAmount,
        method: selectedMethod,
        status: 'Completed',
        type: 'Credit'
      };

      db.savePayment(newTx);
      const updatedTxs = db.getPayments();
      setTransactions(updatedTxs);
      calculateBalance(updatedTxs);
      
      setProcessing(false);
      setSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setSuccess(false);
        setIsModalOpen(false);
        setAmount('');
        setIdentifier('');
        setSelectedMethod(null);
      }, 3000);
    }, 2000);
  };

  const handleExportStatement = () => {
    const headers = ['Transaction ID', 'Date', 'Description', 'Method', 'Type', 'Amount (ETB)', 'Status'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.date,
      tx.description,
      tx.method,
      tx.type,
      tx.amount.toString(),
      tx.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `IFTU_Payment_Statement_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openModal = (method: 'Telebirr' | 'CBE') => {
    setSelectedMethod(method);
    setIsModalOpen(true);
    setSuccess(false);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('payments')}</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">{t('payment_desc')}</p>
        </div>
        <button 
          onClick={handleExportStatement}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <Download size={18} />
          {t('export_statement')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between h-full min-h-[240px]">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Wallet size={140} />
           </div>
           <div className="relative z-10">
             <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">{t('outstanding_balance')}</p>
             <h3 className="text-5xl font-black mt-4 tracking-tighter">{Math.max(0, balance).toLocaleString()} <span className="text-xl text-slate-400 font-bold">ETB</span></h3>
           </div>
           <div className="relative z-10 pt-8">
              {balance <= 0 ? (
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={14} /> Fully Paid
                 </div>
              ) : (
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 text-xs font-bold">
                    <AlertCircle size={14} /> Payment Due
                 </div>
              )}
           </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Telebirr Card */}
           <button 
             onClick={() => openModal('Telebirr')}
             className="bg-white p-8 rounded-[2.5rem] border border-sky-100 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all group text-left relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-sky-100 text-[#0090C1] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                   <Smartphone size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-[#0090C1] transition-colors">Telebirr</h3>
                <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">Fast, secure mobile money payment via Ethio Telecom.</p>
                <div className="mt-8 flex items-center gap-2 text-[#0090C1] text-xs font-black uppercase tracking-widest">
                  {t('pay_now')} <ArrowRight size={14} />
                </div>
              </div>
           </button>

           {/* CBE Card */}
           <button 
             onClick={() => openModal('CBE')}
             className="bg-white p-8 rounded-[2.5rem] border border-purple-100 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all group text-left relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                   <Building2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">Bank Transfer (CBE)</h3>
                <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">Direct transfer from Commercial Bank of Ethiopia.</p>
                <div className="mt-8 flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-widest">
                  {t('pay_now')} <ArrowRight size={14} />
                </div>
              </div>
           </button>
        </div>
      </div>

      {/* Desktop Transaction History */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
           <History className="text-slate-400" size={20} />
           <h3 className="font-bold text-slate-800 text-lg">{t('transaction_history')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Description</th>
                <th className="px-10 py-6">Method</th>
                <th className="px-10 py-6 text-right">Amount</th>
                <th className="px-10 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/20 transition-colors">
                   <td className="px-10 py-6 text-sm font-bold text-slate-600">{tx.date}</td>
                   <td className="px-10 py-6 text-sm font-bold text-slate-800">{tx.description}</td>
                   <td className="px-10 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                        tx.method === 'Telebirr' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        tx.method === 'CBE' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {tx.method}
                      </span>
                   </td>
                   <td className="px-10 py-6 text-right">
                      <div className={`text-sm font-black flex items-center justify-end gap-2 ${
                        tx.type === 'Credit' ? 'text-emerald-500' : 'text-slate-800'
                      }`}>
                        {tx.type === 'Credit' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {tx.amount.toLocaleString()} ETB
                      </div>
                   </td>
                   <td className="px-10 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {tx.status === 'Completed' ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <AlertCircle size={16} className="text-amber-500" />
                        )}
                        <span className={`text-xs font-bold ${tx.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {tx.status}
                        </span>
                      </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Transaction History (Card View) */}
      <div className="md:hidden space-y-6">
         <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
            <History className="text-slate-400" size={20} />
            <h3 className="font-bold text-slate-800 text-lg">{t('transaction_history')}</h3>
         </div>
         {transactions.map(tx => (
            <div key={tx.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                     <p className="text-[10px] text-slate-400 font-bold mt-1">{tx.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border ${
                        tx.method === 'Telebirr' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        tx.method === 'CBE' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {tx.method}
                  </span>
               </div>
               <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-2">
                     {tx.status === 'Completed' ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded">
                           <CheckCircle2 size={12} /> {tx.status}
                        </div>
                     ) : (
                        <div className="flex items-center gap-1 text-amber-600 text-[10px] font-bold bg-amber-50 px-2 py-1 rounded">
                           <AlertCircle size={12} /> {tx.status}
                        </div>
                     )}
                  </div>
                  <div className={`text-sm font-black flex items-center gap-1 ${
                        tx.type === 'Credit' ? 'text-emerald-500' : 'text-slate-800'
                      }`}>
                        {tx.type === 'Credit' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {tx.amount.toLocaleString()} ETB
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => !processing && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             
             {success ? (
               <div className="p-12 flex flex-col items-center text-center space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-black text-slate-800">{t('payment_success')}</h3>
                    <p className="text-slate-500 font-medium mt-2">Your transaction has been processed securely.</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col items-center">
                       <Signature className="w-32 h-20 -mb-4" />
                       <p className="text-[10px] font-black uppercase text-slate-400 mt-1">Approved by Director</p>
                    </div>
                  </div>
               </div>
             ) : (
               <>
                 <div className={`p-8 border-b border-slate-100 flex items-center justify-between shrink-0 ${
                   selectedMethod === 'Telebirr' ? 'bg-sky-50/50' : 'bg-purple-50/50'
                 }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        selectedMethod === 'Telebirr' ? 'bg-sky-100 text-[#0090C1]' : 'bg-purple-100 text-purple-600'
                      }`}>
                         {selectedMethod === 'Telebirr' ? <Smartphone size={24} /> : <Building2 size={24} />}
                      </div>
                      <div>
                        <h3 className={`text-xl font-black ${selectedMethod === 'Telebirr' ? 'text-sky-900' : 'text-purple-900'}`}>
                          {selectedMethod === 'Telebirr' ? t('telebirr_pay') : 'Bank Transfer (CBE)'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Secure Gateway</p>
                      </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                      <X size={24} />
                    </button>
                 </div>

                 <div className="px-8 pt-8 pb-0">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiary Account</p>
                       <p className="text-lg font-bold text-slate-800 mt-1">Jemal Fano Haji</p>
                       <p className="text-xs text-slate-500 font-mono mt-1">{selectedMethod === 'Telebirr' ? '+251 911 *** ***' : '100028*** ***'}</p>
                    </div>
                 </div>

                 <form onSubmit={handlePayment} className="p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                         {selectedMethod === 'Telebirr' ? t('enter_phone') : t('enter_account')}
                       </label>
                       <input 
                         required
                         type={selectedMethod === 'Telebirr' ? "tel" : "text"}
                         placeholder={selectedMethod === 'Telebirr' ? "09..." : "Your Account Number..."}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all font-bold text-slate-700"
                         value={identifier}
                         onChange={(e) => setIdentifier(e.target.value)}
                         disabled={processing}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('amount_etb')}</label>
                       <input 
                         required
                         type="number"
                         min="1"
                         placeholder="0.00"
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all font-bold text-slate-700"
                         value={amount}
                         onChange={(e) => setAmount(e.target.value)}
                         disabled={processing}
                       />
                    </div>

                    <button 
                      type="submit" 
                      disabled={processing}
                      className={`w-full py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
                        selectedMethod === 'Telebirr' 
                        ? 'bg-[#0090C1] shadow-sky-500/20 hover:bg-sky-600' 
                        : 'bg-purple-600 shadow-purple-500/20 hover:bg-purple-700'
                      } ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                       {processing ? (
                         <>
                           <Loader2 size={18} className="animate-spin" />
                           {t('payment_processing')}
                         </>
                       ) : (
                         <>
                           <CreditCard size={18} />
                           {t('pay_now')}
                         </>
                       )}
                    </button>
                 </form>
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

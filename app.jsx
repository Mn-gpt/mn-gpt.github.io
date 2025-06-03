import { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState(['عام', 'تعليمي', 'إبداعي', 'تحليل بيانات', 'برمجة']);
  const [newPrompt, setNewPrompt] = useState({ text: '', category: '', tokens: 0 });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [signature, setSignature] = useState('MN.gpt');

  // Mock data
  useEffect(() => {
    const mockPrompts = [
      { id: 1, text: 'اشرح مفهوم الذكاء الاصطناعي بطريقة بسيطة.', category: 'تعليمي', tokens: 23 },
      { id: 2, text: 'اكتب قصة قصيرة عن رحلة إلى الفضاء.', category: 'إبداعي', tokens: 45 },
      { id: 3, text: 'ما هو تأثير التكنولوجيا على التعليم؟', category: 'تحليل بيانات', tokens: 18 },
      { id: 4, text: 'اشرح كيف تعمل خوارزميات التعلم العميق.', category: 'تعليمي', tokens: 37 },
      { id: 5, text: 'اكتب برنامجًا بلغة جافاسكربت لحساب العوامل.', category: 'برمجة', tokens: 41 },
    ];
    setPrompts(mockPrompts);
  }, []);

  const handleAddPrompt = (e) => {
    e.preventDefault();
    if (!newPrompt.text || !newPrompt.category) return;

    const promptToAdd = {
      ...newPrompt,
      id: Date.now(),
    };

    setPrompts([...prompts, promptToAdd]);
    setNewPrompt({ text: '', category: '', tokens: 0 });
  };

  const handleDeletePrompt = (id) => {
    setPrompts(prompts.filter(prompt => prompt.id !== id));
  };

  const handleAddCategory = () => {
    if (!newPrompt.category.trim()) return;
    if (categories.includes(newPrompt.category)) return;
    setCategories([...categories, newPrompt.category]);
  };

  const handleStartEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category);
  };

  const handleUpdateCategory = () => {
    if (!editCategoryName.trim()) return;

    const updatedPrompts = prompts.map(prompt =>
      prompt.category === editingCategory ? { ...prompt, category: editCategoryName } : prompt
    );

    const updatedCategories = categories.map(cat =>
      cat === editingCategory ? editCategoryName : cat
    );

    setPrompts(updatedPrompts);
    setCategories(updatedCategories);
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleDeleteCategory = (categoryToDelete) => {
    if (!window.confirm(`هل أنت متأكد من حذف القسم "${categoryToDelete}" وجميع البرومبتات المرتبطة به؟`)) return;
    setCategories(categories.filter(cat => cat !== categoryToDelete));
    setPrompts(prompts.filter(prompt => prompt.category !== categoryToDelete));
  };

  const getCategoryStats = () => {
    const stats = {};
    categories.forEach(category => {
      const categoryPrompts = prompts.filter(p => p.category === category);
      stats[category] = {
        count: categoryPrompts.length,
        totalTokens: categoryPrompts.reduce((sum, p) => sum + p.tokens, 0),
        averageTokens: categoryPrompts.length > 0 ?
          Math.round(categoryPrompts.reduce((sum, p) => sum + p.tokens, 0) / categoryPrompts.length) : 0
      };
    });
    return stats;
  };

  const renderDashboard = () => {
    const stats = getCategoryStats();

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">إجمالي البرومبتات</h3>
            <p className="text-3xl font-bold text-indigo-600">{prompts.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">إجمالي التوكيانات</h3>
            <p className="text-3xl font-bold text-blue-600">
              {prompts.reduce((sum, p) => sum + p.tokens, 0)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">عدد الأقسام</h3>
            <p className="text-3xl font-bold text-green-600">{categories.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد البرومبتات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجمالي التوكيانات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">متوسط التوكيانات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(stats).map(([category, data]) => (
                <tr key={category} className="hover:bg-gray-50">
                  <td className="

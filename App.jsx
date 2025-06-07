// App.jsx

const { useState, useEffect } = React;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newPrompt, setNewPrompt] = useState({ text: '', category: '', tokens: 0 });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [signature] = useState('MN.gpt');

  const isUserAdmin = localStorage.getItem('isAdmin') === 'true';

  // 🔽 تحميل البيانات من db.json
  useEffect(() => {
    fetch('db.json')
      .then(res => res.json())
      .then(data => {
        setPrompts(data.prompts);
        setCategories(data.categories);
      })
      .catch(err => {
        console.error("فشل تحميل البيانات من db.json");
        const savedPrompts = JSON.parse(localStorage.getItem('prompts')) || [
          { id: 1, text: 'اشرح مفهوم الذكاء الاصطناعي بطريقة بسيطة.', category: 'تعليمي', tokens: 23 },
          { id: 2, text: 'اكتب قصة قصيرة عن رحلة إلى الفضاء.', category: 'إبداعي', tokens: 45 },
          { id: 3, text: 'ما هو تأثير التكنولوجيا على التعليم؟', category: 'تحليل بيانات', tokens: 18 },
          { id: 4, text: 'اشرح كيف تعمل خوارزميات التعلم العميق.', category: 'تعليمي', tokens: 37 },
          { id: 5, text: 'اكتب برنامجًا بلغة جافاسكربت لحساب العوامل.', category: 'برمجة', tokens: 41 },
        ];
        const savedCategories = ['عام', 'تعليمي', 'إبداعي', 'تحليل بيانات', 'برمجة'];
        setPrompts(savedPrompts);
        setCategories(savedCategories);
      });
  }, []);

  // 📦 حفظ البيانات في localStorage
  const saveToLocalStorage = (updatedPrompts, updatedCategories) => {
    localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  // ➕ إضافة برومبت جديد
  const handleAddPrompt = (e) => {
    e.preventDefault();
    if (!newPrompt.text || !newPrompt.category) return;
    const promptToAdd = { ...newPrompt, id: Date.now() };
    const updatedPrompts = [...prompts, promptToAdd];
    const updatedCategories = categories.includes(newPrompt.category)
      ? categories
      : [...categories, newPrompt.category];
    setPrompts(updatedPrompts);
    setCategories(updatedCategories);
    saveToLocalStorage(updatedPrompts, updatedCategories);
    setNewPrompt({ text: '', category: '', tokens: 0 });
  };

  // ❌ حذف برومبت
  const handleDeletePrompt = (id) => {
    const updatedPrompts = prompts.filter(prompt => prompt.id !== id);
    setPrompts(updatedPrompts);
    saveToLocalStorage(updatedPrompts, categories);
  };

  // ➕ إضافة قسم جديد
  const handleAddCategory = () => {
    if (!newPrompt.category.trim()) return;
    if (categories.includes(newPrompt.category)) {
      alert("هذا القسم موجود مسبقًا");
      return;
    }
    const updatedCategories = [...categories, newPrompt.category];
    setCategories(updatedCategories);
    saveToLocalStorage(prompts, updatedCategories);
  };

  // ✏️ تعديل اسم القسم
  const handleStartEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category);
  };

  const handleUpdateCategory = () => {
    if (!editCategoryName.trim()) return;
    const updatedPrompts = prompts.map(p =>
      p.category === editingCategory ? { ...p, category: editCategoryName } : p
    );
    const updatedCategories = categories.map(cat =>
      cat === editingCategory ? editCategoryName : cat
    );
    setPrompts(updatedPrompts);
    setCategories(updatedCategories);
    setEditingCategory(null);
    setEditCategoryName('');
    saveToLocalStorage(updatedPrompts, updatedCategories);
  };

  // ❌ حذف قسم
  const handleDeleteCategory = (categoryToDelete) => {
    if (!window.confirm(`هل أنت متأكد من حذف القسم "${categoryToDelete}" وجميع البرومبتات المرتبطة به؟`)) return;
    const updatedPrompts = prompts.filter(p => p.category !== categoryToDelete);
    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    setPrompts(updatedPrompts);
    setCategories(updatedCategories);
    saveToLocalStorage(updatedPrompts, updatedCategories);
  };

  // 🔍 البحث والفرز
  const filteredPrompts = prompts.filter(prompt =>
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrompts = filteredPrompts.slice(indexOfFirstItem, indexOfLastItem);

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < Math.ceil(filteredPrompts.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 📊 إحصاءات الأقسام
  const getCategoryStats = () => {
    const stats = {};
    categories.forEach(category => {
      const catPrompts = prompts.filter(p => p.category === category);
      const totalTokens = catPrompts.reduce((sum, p) => sum + p.tokens, 0);
      stats[category] = {
        count: catPrompts.length,
        totalTokens: totalTokens,
        averageTokens: catPrompts.length > 0 ? Math.round(totalTokens / catPrompts.length) : 0
      };
    });
    return stats;
  };

  // 💾 تصدير البرومبتات إلى Markdown
  const exportPromptsToMarkdown = () => {
    let markdown = '# 📝 قائمة البرومبتات\n';
    const groupedByCategory = {};
    prompts.forEach(prompt => {
      if (!groupedByCategory[prompt.category]) groupedByCategory[prompt.category] = [];
      groupedByCategory[prompt.category].push(prompt);
    });
    Object.entries(groupedByCategory).forEach(([category, promptList]) => {
      markdown += `## 📁 القسم: ${category}\n`;
      promptList.forEach((prompt, index) => {
        markdown += `${index + 1}. **[${prompt.category}]** ${prompt.text}\n   - \`ID: ${prompt.id}\`\n   - \`tokens: ${prompt.tokens}\`\n`;
      });
    });
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prompts.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 📋 نسخ نص البرومبت
  const copyPromptText = (text) => {
    navigator.clipboard.writeText(text);
    alert("تم نسخ البرومبت!");
  };

  // 💡 عرض لوحة التحكم للمستخدم العادي أو المسؤول
  const renderDashboard = () => {
    const stats = getCategoryStats();
    const totalPrompts = prompts.length;
    const totalTokens = prompts.reduce((sum, p) => sum + p.tokens, 0);
    const averageTokens = totalPrompts > 0 ? Math.round(totalTokens / totalPrompts) : 0;
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم</h2>
        {/* رسالة للمستخدم العادي */}
        {!isUserAdmin && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded text-sm">
            ⚠️ ملاحظة: أنت مستخدم عادي، يمكنك فقط النقر على القسم لرؤية البرومبتات.
          </div>
        )}
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">عدد البرومبتات</h3>
            <p className="text-3xl font-bold text-indigo-600">{totalPrompts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">عدد الكلمات (tokens)</h3>
            <p className="text-3xl font-bold text-blue-600">{totalTokens}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">متوسط tokens</h3>
            <p className="text-3xl font-bold text-green-600">{averageTokens} token</p>
          </div>
        </div>
        {/* قائمة الأقسام للمستخدم العادي */}
        {!isUserAdmin ? (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">الأقسام المتاحة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(cat => (
                <a
                  key={cat}
                  href={`category-prompts.html?category=${encodeURIComponent(cat)}`}
                  className="bg-white p-4 rounded shadow hover:bg-gray-50 transition flex justify-between items-center"
                >
                  <span className="font-medium text-indigo-600">{cat}</span>
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
              {categories.length === 0 && (
                <p className="text-gray-500">لا توجد أقسام مضافة بعد.</p>
              )}
            </div>
          </div>
        ) : (
          // Table of Category Stats للمسؤول فقط
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد البرومبتات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجمالي tokens</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">متوسط tokens</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(stats).map(([category, data]) => (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{data.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{data.totalTokens}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{data.averageTokens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // 💡 إدارة البرومبتات (للمسؤول فقط)
  const renderPromptsManagement = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">إدارة البرومبتات</h2>
        {/* شريط البحث */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="ابحث في البرومبتات..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {/* Form لإضافة برومبت */}
        <form onSubmit={handleAddPrompt} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <label className="block text-sm font-medium text-gray-700">نص البرومبت</label>
          <textarea
            rows="4"
            placeholder="مثال: اشرح مفهوم الذكاء الاصطناعي..."
            value={newPrompt.text}
            onChange={(e) => {
              const text = e.target.value;
              setNewPrompt({
                ...newPrompt,
                text,
                tokens: Math.ceil(text.split(/\s+/).length * 1.25),
              });
            }}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
          <div className="text-sm text-gray-600">
            عدد tokens المتوقعة: <strong>{Math.ceil(newPrompt.text.split(/\s+/).length * 1.25)}</strong>
          </div>
          <label className="block text-sm font-medium text-gray-700 mt-4">القسم</label>
          <select
            value={newPrompt.category}
            onChange={(e) => setNewPrompt({...newPrompt, category: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">اختر قسمًا</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">أدخل اسم قسم جديد (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: تسويقي"
              value={newPrompt.category}
              onChange={(e) => setNewPrompt({...newPrompt, category: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              إضافة برومبت
            </button>
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={!newPrompt.category.trim() || categories.includes(newPrompt.category)}
              className={`inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition ${
                categories.includes(newPrompt.category)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              إضافة قسم جديد
            </button>
          </div>
        </form>
        {/* زر التصدير */}
        {isUserAdmin && (
          <div className="flex justify-end">
            <button
              onClick={exportPromptsToMarkdown}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
            >
              📥 تصدير إلى Markdown
            </button>
          </div>
        )}
        {/* قائمة البرومبتات */}
        <ul className="divide-y divide-gray-200">
          {currentPrompts.length > 0 ? (
            currentPrompts.map(prompt => (
              <li key={prompt.id} className="bg-white p-4 rounded shadow mb-3 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="pr-4">
                    <p className="font-medium">**[{prompt.category}]** {prompt.text}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <span>ID: `{prompt.id}`</span> • <span>Tokens: `{prompt.tokens}`</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => copyPromptText(prompt.text)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      نسخ
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="text-center py-4 text-gray-500">لا توجد برومبتات مضافة بعد</li>
          )}
        </ul>
        {/* Pagination Controls */}
        {filteredPrompts.length > itemsPerPage && (
          <div className="flex justify-center space-x-2 rtl:space-x-reverse mt-6">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              السابق
            </button>
            {Array.from({ length: Math.ceil(filteredPrompts.length / itemsPerPage) }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={goToNext}
              disabled={currentPage === Math.ceil(filteredPrompts.length / itemsPerPage)}
              className={`px-4 py-2 rounded ${
                currentPage === Math.ceil(filteredPrompts.length / itemsPerPage)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              التالي
            </button>
          </div>
        )}
        {/* قائمة الأقسام */}
        {isUserAdmin && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">الأقسام</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat} className="bg-gray-50 p-3 rounded flex justify-between items-center hover:bg-gray-100 transition">
                  {editingCategory === cat ? (
                    <>
                      <input
                        className="border p-1 rounded w-full"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                      />
                      <button
                        onClick={handleUpdateCategory}
                        className="text-green-600 mr-2"
                      >
                        حفظ
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{cat}</span>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleStartEditCategory(cat)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-center py-2 text-gray-500">لا توجد أقسام مضافة بعد.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-6xl">
      {/* Header */}
<!-- Banner -->
<div class="mb-6">
  <img src="banner.jpg" alt="بانير موقع Promptica" class="w-full h-auto rounded-lg shadow-md">
</div>

<!-- Header -->
<header className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
  <h1 className="flex items-center text-3xl font-bold text-indigo-700">
    <img src="logo.png" alt="شعار Promptica" className="w-8 h-8 mr-2" />
    Promptica
  </h1>
  <div className="space-x-4 rtl:space-x-reverse">
    <a href="welcome.html" className="text-indigo-600 hover:text-indigo-800 underline">الترحيب</a>
    <a href="#" onClick={() => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "logout.html";
    }} className="text-gray-700 hover:text-indigo-600">تسجيل الخروج</a>
  </div>
</header>
      {/* Tabs Navigation */}
      <div className="flex space-x-4 rtl:space-x-reverse mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setCurrentPage(1);
          }}
          className={`py-2 px-4 font-medium ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600'
          }`}
        >
          لوحة التحكم
        </button>
        {isUserAdmin && (
          <button
            onClick={() => {
              setActiveTab('prompts');
              setCurrentPage(1);
            }}
            className={`py-2 px-4 font-medium ${
              activeTab === 'prompts'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600'
            }`}
          >
            إدارة البرومبتات
          </button>
        )}
      </div>
      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'prompts' && isUserAdmin && renderPromptsManagement()}
      {/* Footer */}
      <footer className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {signature}. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}

// Render App
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

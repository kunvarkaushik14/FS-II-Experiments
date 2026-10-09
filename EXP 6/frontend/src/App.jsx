import { useEffect, useState } from "react";
import "./App.css";


const navigation = [
  { id: "dashboard", icon: "⌂", label: "Dashboard" },
  { id: "records", icon: "▣", label: "Records" },
  { id: "analytics", icon: "◒", label: "Analytics" },
  { id: "ai", icon: "✦", label: "AI / RAG", badge: "AI" },
  { id: "performance", icon: "◫", label: "Performance" },
  { id: "database", icon: "◇", label: "Database" },
];

const knowledgeBase = [
  {
    id: "pagination",
    title: "Pagination",
    keywords: ["pagination", "pageable", "page", "page size", "spring data pageable"],
    answer:
      "EXP 6 uses Spring Data Pageable to divide a large dataset into smaller pages. The client can send page, size and sort parameters so the backend returns only the requested slice of data.",
    source: "EXP 6 — Pagination & Sorting",
  },
  {
    id: "sorting",
    title: "Sorting",
    keywords: ["sorting", "sort", "ascending", "descending", "order"],
    answer:
      "Sorting is handled on the backend through Spring Data Pageable. For example, sort=id,desc sorts records by ID in descending order.",
    source: "EXP 6 — Pagination & Sorting",
  },
  {
    id: "caching",
    title: "Caching",
    keywords: ["cache", "caching", "ehcache", "cacheable", "cacheevict", "cached"],
    answer:
      "EXP 6 uses Spring Cache with @Cacheable to avoid repeated database reads. @CacheEvict clears cached data after add, delete and update operations so stale values are not retained.",
    source: "EXP 6 — Spring Cache / Ehcache",
  },
  {
    id: "n-plus-one",
    title: "N+1 Problem",
    keywords: ["n+1", "n + 1", "n plus one", "multiple queries", "related records"],
    answer:
      "The N+1 problem occurs when loading a collection causes additional queries for related records. This can increase database round trips as the number of parent records grows.",
    source: "EXP 6 — Database Optimization",
  },
  {
    id: "join-fetch",
    title: "JOIN FETCH",
    keywords: ["join fetch", "left join fetch", "fetch join", "distinct"],
    answer:
      "EXP 6 demonstrates LEFT JOIN FETCH with DISTINCT to retrieve a parent entity and its related records together, reducing the extra database queries associated with the N+1 pattern.",
    source: "EXP 6 — TaskRepository.java",
  },
  {
    id: "native-sql",
    title: "Native SQL",
    keywords: ["native", "sql", "native query", "query", "latest five"],
    answer:
      "EXP 6 demonstrates a native SQL query for retrieving the latest five records directly from the database.",
    source: "EXP 6 — TaskRepository.java",
  },
  {
    id: "architecture",
    title: "Architecture",
    keywords: ["architecture", "spring boot", "react", "frontend", "backend", "api"],
    answer:
      "The EXP 6 interface is a React frontend connected to a Spring Boot backend. The product API provides paginated and sortable data, while the interface presents Dashboard, Records, Analytics, AI/RAG, Performance and Database views.",
    source: "EXP 6 — Application Architecture",
  },
  {
    id: "performance",
    title: "Performance",
    keywords: ["performance", "latency", "response time", "jmeter", "benchmark"],
    answer:
      "The Performance view measures the latest product API response time in the browser and presents it alongside the EXP 6 optimization concepts such as caching and JOIN FETCH.",
    source: "EXP 6 — Performance Lab",
  },
];

  function App() {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("exp6_user");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        localStorage.removeItem("exp6_user");
        return null;
      }
    }

    return null;
  });

  
  
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("exp6_logged_in") === "true"
  );

  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [backendOnline, setBackendOnline] = useState(false);
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(0);
  const [productSize, setProductSize] = useState(5);
  const [productSort, setProductSort] = useState("id,desc");
  const [productKeyword, setProductKeyword] = useState("");
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotalElements, setProductTotalElements] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);
  const [performanceSamples, setPerformanceSamples] = useState([]);
  const [productsError, setProductsError] = useState("");
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    categories: 0,
    lowStock: 0,
    outOfStock: 0,
    averagePrice: 0,
    totalStock: 0,
    categoryBreakdown: [],
    topProducts: [],
  });
  const [apiLatency, setApiLatency] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productEditor, setProductEditor] = useState(null);
  const [productSaveLoading, setProductSaveLoading] = useState(false);
  const [productSaveError, setProductSaveError] = useState("");
  const [productCreator, setProductCreator] = useState(null);
  const [productCreateLoading, setProductCreateLoading] = useState(false);
  const [productCreateError, setProductCreateError] = useState("");



  function viewProduct(product) {
    setSelectedProduct(product);
  }

  async function deleteProduct(productId) {
    if (!window.confirm("Delete this product from the database?")) return;
    try {
      const response = await fetch(`http://localhost:8081/api/products/${productId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
      setSelectedProduct(null);
      await loadProductData();
      await loadProductStats();
    } catch (error) {
      console.error("Product delete:", error);
      alert("Delete failed. Make sure your Spring Boot DELETE /api/products/{id} endpoint exists.");
    }
  }


  function openProductEditor(product) {
    setProductSaveError("");
    setProductEditor({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price ?? "",
      stock: product.stock ?? 0,
      active: Boolean(product.active),
    });
  }


  function openProductCreator() {
    setProductCreateError("");
    setProductCreator({
      name: "",
      category: "",
      price: "",
      stock: 0,
      description: "",
      active: true,
    });
  }

  async function createProduct() {
    if (!productCreator) return;

    if (!productCreator.name.trim() || !productCreator.category.trim()) {
      setProductCreateError("Product name and category are required.");
      return;
    }

    setProductCreateLoading(true);
    setProductCreateError("");

    try {
      const response = await fetch(
        "http://localhost:8081/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: productCreator.name.trim(),
            category: productCreator.category.trim(),
            price: Number(productCreator.price),
            stock: Number(productCreator.stock),
            description: productCreator.description.trim(),
            active: Boolean(productCreator.active),
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Create failed (${response.status})`);
      }

      setProductCreator(null);
      setProductPage(0);
      await loadProductData();
      if (typeof loadProductStats === "function") {
        await loadProductStats();
      }
    } catch (error) {
      console.error("EXP 6 Product Create:", error);
      setProductCreateError(
        "Could not create the product. Check that Spring Boot POST /api/products is running."
      );
    } finally {
      setProductCreateLoading(false);
    }
  }

  async function saveProduct() {
    if (!productEditor?.id) return;

    setProductSaveLoading(true);
    setProductSaveError("");

    try {
      const response = await fetch(
        `http://localhost:8081/api/products/${productEditor.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: productEditor.name,
            description: productEditor.description,
            category: productEditor.category,
            price: Number(productEditor.price),
            stock: Number(productEditor.stock),
            active: Boolean(productEditor.active),
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Update failed (${response.status})`);
      }

      setProductEditor(null);
      await loadProductData();
      if (typeof loadProductStats === "function") {
        await loadProductStats();
      }
    } catch (error) {
      console.error("EXP 6 Product Update:", error);
      setProductSaveError(
        "Update failed. Check that Spring Boot exposes PUT /api/products/{id} and accepts these product fields."
      );
    } finally {
      setProductSaveLoading(false);
    }
  }

  async function loadProductData() {
    const startedAt = performance.now();
    try {
      setProductsLoading(true);
      setProductsError("");
      const endpoint = productKeyword.trim()
        ? `http://localhost:8081/api/products/search?keyword=${encodeURIComponent(productKeyword.trim())}&page=${productPage}&size=${productSize}`
        : `http://localhost:8081/api/products?page=${productPage}&size=${productSize}&sort=${encodeURIComponent(productSort)}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Product API returned ${response.status}`);
      const data = await response.json();
      setProducts(data.content || []);
      setProductTotalPages(data.totalPages || 1);
      setProductTotalElements(data.totalElements || 0);
      setBackendOnline(true);
      setApiLatency(Math.round(performance.now() - startedAt));
    } catch (error) {
      console.error("EXP 6 Product API:", error);
      setProductsError("Unable to connect to the EXP 6 product backend.");
      setBackendOnline(false);
      setApiLatency(null);
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadProductStats() {
    try {
      const response = await fetch(
        "http://localhost:8081/api/products?page=0&size=1000&sort=id,desc"
      );
      if (!response.ok) throw new Error(`Stats API returned ${response.status}`);

      const data = await response.json();
      const allProducts = Array.isArray(data.content) ? data.content : [];
      const active = allProducts.filter((product) => product?.active).length;
      const categories = new Set(
        allProducts.map((product) => product?.category).filter(Boolean)
      ).size;

      const lowStock = allProducts.filter(
        (product) => Number(product?.stock ?? 0) > 0 && Number(product?.stock ?? 0) <= 10
      ).length;

      const outOfStock = allProducts.filter(
        (product) => Number(product?.stock ?? 0) <= 0
      ).length;

      const totalStock = allProducts.reduce(
        (sum, product) => sum + Number(product?.stock ?? 0),
        0
      );

      const pricedProducts = allProducts.filter(
        (product) => Number.isFinite(Number(product?.price))
      );

      const averagePrice = pricedProducts.length
        ? pricedProducts.reduce((sum, product) => sum + Number(product.price), 0) / pricedProducts.length
        : 0;

      const categoryMap = {};
      allProducts.forEach((product) => {
        const category = product?.category || "Other";
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });

      const categoryBreakdown = Object.entries(categoryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const topProducts = [...allProducts]
        .sort((a, b) => Number(b?.totalSold ?? 0) - Number(a?.totalSold ?? 0))
        .slice(0, 5);

      setProductStats({
        total: Number(data.totalElements ?? allProducts.length),
        active,
        inactive: allProducts.length - active,
        categories,
        lowStock,
        outOfStock,
        averagePrice,
        totalStock,
        categoryBreakdown,
        topProducts,
      });
      setBackendOnline(true);
    } catch (error) {
      console.error("EXP 6 Product Stats API:", error);
    }
  }


  async function measureProductApi() {
    const started = performance.now();

    try {
      const response = await fetch(
        `http://localhost:8081/api/products?page=0&size=5&sort=${encodeURIComponent(productSort)}`
      );

      const elapsed = Math.round(performance.now() - started);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      setPerformanceSamples((previous) => [
        ...previous.slice(-5),
        {
          time: new Date().toLocaleTimeString(),
          latency: elapsed,
          status: "Success",
        },
      ]);

      return elapsed;
    } catch (error) {
      const elapsed = Math.round(performance.now() - started);

      setPerformanceSamples((previous) => [
        ...previous.slice(-5),
        {
          time: new Date().toLocaleTimeString(),
          latency: elapsed,
          status: "Failed",
        },
      ]);

      throw error;
    }
  }

  useEffect(() => {
    if (loggedIn) loadProductData();
  }, [productPage, productSize, productSort, productKeyword, loggedIn]);

  useEffect(() => {
    if (loggedIn) loadProductStats();
  }, [loggedIn]);


  const [aiInput, setAiInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Welcome to EXP 6 Intelligence. Ask me about pagination, sorting, caching, N+1, JOIN FETCH or native SQL.",
      source: "EXP 6 Knowledge Base",
    },
  ]);

  useEffect(() => {
    const resetRag = () => {
      setMessages([{
        role: "assistant",
        text: "RAG context cleared. Ask a new question about the EXP 6 implementation or live product data.",
        source: "EXP 6 Knowledge Base",
        confidence: 100,
      }]);
    };
    window.addEventListener("exp6-clear-rag", resetRag);
    return () => window.removeEventListener("exp6-clear-rag", resetRag);
  }, []);

  function retrieveKnowledge(question) {
    const normalized = question.toLowerCase().trim();

    const scored = knowledgeBase
      .map((item) => {
        const score = item.keywords.reduce((total, keyword) => {
          const term = keyword.toLowerCase();
          if (normalized.includes(term)) return total + (term.includes(" ") ? 3 : 2);
          return total;
        }, 0);

        const titleBonus =
          normalized.includes(item.title.toLowerCase()) ? 4 : 0;

        return {
          ...item,
          score: score + titleBonus,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 2);
  }

  function buildProductContext(question) {
    const normalized = question.toLowerCase();

    const asksProductCount =
      normalized.includes("how many product") ||
      normalized.includes("total product") ||
      normalized.includes("number of product");

    const asksActive =
      normalized.includes("active product") ||
      normalized.includes("active");

    const asksInactive =
      normalized.includes("inactive product") ||
      normalized.includes("inactive");

    const asksCategory =
      normalized.includes("categor") ||
      normalized.includes("categories");

    const facts = [];

    if (asksProductCount && productStats.total) {
      facts.push(`There are ${productStats.total} products in the database.`);
    }

    if (asksActive && productStats.total) {
      facts.push(`${productStats.active} products are currently active.`);
    }

    if (asksInactive && productStats.total) {
      facts.push(`${productStats.inactive} products are currently inactive.`);
    }

    if (asksCategory && productStats.categories) {
      facts.push(`The database contains ${productStats.categories} unique product categories.`);
    }

    if (normalized.includes("product") && products.length) {
      const names = products
        .slice(0, 5)
        .map((product) => product?.name)
        .filter(Boolean);

      if (names.length) {
        facts.push(`Products currently visible on the loaded page include: ${names.join(", ")}.`);
      }
    }

    return facts;
  }

  function askAI(event) {
    event.preventDefault();

    const question = aiInput.trim();
    if (!question) return;

    const retrieved = retrieveKnowledge(question);
    const productFacts = buildProductContext(question);

    let answer = "";
    let source = "EXP 6 Knowledge Base";

    if (productFacts.length) {
      answer = productFacts.join(" ");
      source = "EXP 6 Product API + Knowledge Base";
    }

    if (retrieved.length) {
      const conceptAnswer = retrieved
        .map((item) => item.answer)
        .join("\n\n");

      answer = answer
        ? `${answer}

${conceptAnswer}`
        : conceptAnswer;

      source = retrieved.map((item) => item.source).join(" · ");
    }

    if (!answer) {
      answer =
        "I could not find a grounded answer in the EXP 6 knowledge base. Try asking about pagination, sorting, caching, N+1, JOIN FETCH, native SQL, performance, architecture, or product statistics.";
    }

    const confidence = retrieved.length
      ? Math.min(98, 62 + retrieved[0].score * 6)
      : productFacts.length
        ? 88
        : 28;

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: question,
      },
      {
        role: "assistant",
        text: answer,
        source,
        confidence,
        retrieved: retrieved.map((item) => ({
          title: item.title,
          source: item.source,
          score: item.score,
        })),
        productContext: productFacts.length > 0,
      },
    ]);

    setAiInput("");
  }

   function logout() {
    localStorage.removeItem("exp6_user");
    localStorage.removeItem("exp6_logged_in");
    setUser(null);
    setLoggedIn(false);
    setActivePage("dashboard");
  }

if (!loggedIn) {
  return (
    <Login
      onLogin={(newUser) => {
        setUser(newUser);
        localStorage.setItem("exp6_logged_in", "true");
        setLoggedIn(true);
      }}
    />
  );
}

  return (
    <div className="app-shell">

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            ✦
          </div>

          <div>
            <strong>
              EXP<span> 6</span>
            </strong>

            <small>
              DATA INTELLIGENCE
            </small>
          </div>

        </div>

        <div className="workspace">
          <span />
          EXP 6 WORKSPACE
        </div>

        <div className="nav-heading">
          NAVIGATION
        </div>

        <nav className="navigation">

          {navigation.map((item) => (
            <button
              key={item.id}
              className={
                activePage === item.id
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActivePage(item.id)
              }
            >

              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

              {item.badge && (
                <em>
                  {item.badge}
                </em>
              )}

            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="system-box">

            <small>
              SYSTEM STATUS
            </small>

            <SystemRow
              name="Spring Boot"
              value={
                backendOnline
                  ? "ONLINE"
                  : "WAITING"
              }
              online={backendOnline}
            />

            <SystemRow
              name="Cache"
              value="ACTIVE"
              online
            />

            <SystemRow
              name="RAG"
              value="READY"
              online
            />

          </div>

         <div className="profile">

  <div className="avatar">
    {user?.name?.charAt(0)?.toUpperCase() || "U"}
  </div>

  <div>
    <strong>
      {user?.name || "User"}
    </strong>

    <small>
      {user?.email || "user@example.com"}
    </small>
  </div>

  <button
    className="logout-mini"
    onClick={logout}
    title="Logout"
  >
    ↪
  </button>

</div>

        </div>

      </aside>

      <main className="main">

        <header className="topbar">

          <div className="search-bar">

            <span>⌕</span>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search anything..."
            />

            <kbd>⌘ K</kbd>

          </div>

          <div className="top-actions">

            <div className="connection">

              <span
                className={
                  backendOnline
                    ? "dot online"
                    : "dot waiting"
                }
              />

              {backendOnline
                ? "API Connected"
                : "API Waiting"}

            </div>

            <button className="icon-button">
              ◌
            </button>

            <div className="top-user">

  <div className="avatar small">
    {user?.name?.charAt(0)?.toUpperCase() || "U"}
  </div>

  <div>
    <strong>
      {user?.name || "User"}
    </strong>

    <small>
      {user?.email || "user@example.com"}
    </small>
  </div>

</div>

          </div>

        </header>

        <section className="content">

          {activePage === "dashboard" && (
            <Dashboard
              total={productStats.total || productTotalElements}
              activeCount={productStats.active}
              inactiveCount={productStats.inactive}
              categoryCount={productStats.categories}
              products={products}
              online={backendOnline}
              navigate={setActivePage}
              lowStock={productStats.lowStock}
              outOfStock={productStats.outOfStock}
              averagePrice={productStats.averagePrice}
              totalStock={productStats.totalStock}
              categoryBreakdown={productStats.categoryBreakdown}
              topProducts={productStats.topProducts}
            />
          )}

          {activePage === "records" && (
  <RecordsPage
    products={products}
    page={productPage}
    size={productSize}
    sort={productSort}
    totalPages={productTotalPages}
    totalElements={productTotalElements}
    loading={productsLoading}
    error={productsError}
    setPage={setProductPage}
    setSize={setProductSize}
    setSort={setProductSort}
    searchKeyword={productKeyword}
    setSearchKeyword={setProductKeyword}
    onView={viewProduct}
    onEdit={openProductEditor}
    onDelete={deleteProduct}
    selectedProduct={selectedProduct}
    setSelectedProduct={setSelectedProduct}
    productEditor={productEditor}
    setProductEditor={setProductEditor}
    productSaveLoading={productSaveLoading}
    productSaveError={productSaveError}
    setProductSaveError={setProductSaveError}
    saveProduct={saveProduct}
    onAdd={openProductCreator}
    productCreator={productCreator}
    setProductCreator={setProductCreator}
    productCreateLoading={productCreateLoading}
    productCreateError={productCreateError}
    setProductCreateError={setProductCreateError}
    createProduct={createProduct}
  />

          )}

          {activePage === "analytics" && (
            <Analytics
              total={productStats.total || productTotalElements}
              active={productStats.active}
              inactive={productStats.inactive}
              categories={productStats.categories}
              lowStock={productStats.lowStock}
              outOfStock={productStats.outOfStock}
              averagePrice={productStats.averagePrice}
              totalStock={productStats.totalStock}
              categoryBreakdown={productStats.categoryBreakdown}
              topProducts={productStats.topProducts}
            />
          )}

          {activePage === "ai" && (
            <AIAssistant
              messages={messages}
              input={aiInput}
              setInput={setAiInput}
              askAI={askAI}
              productStats={productStats}
              products={products}
            />
          )}

          {activePage === "performance" && (
            <Performance
              online={backendOnline}
              latency={apiLatency}
              samples={performanceSamples}
              measure={measureProductApi}
            />
          )}

          {activePage === "database" && (
            <Database />
          )}

        </section>

      </main>

    </div>
  );
}


/* =========================
   LOGIN
========================= */

function Login({ onLogin }) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function submit(event) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const user = {
      name: form.name.trim(),
      email: form.email.trim(),
    };

    localStorage.setItem(
      "exp6_user",
      JSON.stringify(user)
    );

    onLogin(user);
  }

  return (
    <div className="login-page">

      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="login-layout">

        {/* LEFT SIDE */}

        <div className="login-hero">

          <div className="hero-brand">

            <div className="brand-logo">
              ✦
            </div>

            <strong>
              EXP<span> 6</span>
            </strong>

          </div>

          <div className="hero-copy">

            <div className="hero-tag">
              FULL STACK EXPERIMENT
            </div>

            <h1>
              Data that moves
              <span> intelligently.</span>
            </h1>

            <p>
              A scalable Spring Boot + React
              platform demonstrating pagination,
              sorting, caching, database
              optimization and AI-powered
              retrieval.
            </p>

          </div>

          <div className="login-features">

            <MiniFeature
              icon="⇄"
              title="Smart APIs"
              text="Pagination + sorting"
            />

            <MiniFeature
              icon="↯"
              title="Fast Reads"
              text="Caching + optimization"
            />

            <MiniFeature
              icon="✦"
              title="AI / RAG"
              text="Grounded knowledge"
            />

          </div>

        </div>

        {/* LOGIN CARD */}

        <form
          className="login-card personal-login"
          onSubmit={submit}
        >

          <div className="login-card-top">

            <span>
              EXP 6 ACCESS
            </span>

            <div className="status-badge">
              <i />
              SYSTEM READY
            </div>

          </div>

          <h2>
            Create your profile
          </h2>

          <p>
            Enter your details to access
            the EXP 6 command center.
          </p>

          {/* NAME */}

          <label>
            FULL NAME

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
            />

          </label>

          {/* EMAIL */}

          <label>
            EMAIL

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />

          </label>

          {/* PASSWORD */}

          <label>
            PASSWORD

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
            />

          </label>

          {/* CONFIRM PASSWORD */}

          <label>
            CONFIRM PASSWORD

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

          </label>

          {error && (
            <div className="login-error">
              <span>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Create Profile
            <span>→</span>
          </button>

          <div className="demo-login">

            <small>
              EXP 6 PROFILE
            </small>

            <span>
              Your profile is saved locally
              for this experiment.
            </span>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================
   DASHBOARD
========================= */
function Dashboard({
  total,
  activeCount = 0,
  inactiveCount = 0,
  categoryCount = 0,
  products = [],
  online,
  navigate,
  lowStock = 0,
  outOfStock = 0,
  averagePrice = 0,
  totalStock = 0,
  categoryBreakdown = [],
  topProducts = [],
}) {
  const healthPercent = total ? Math.round((activeCount / total) * 100) : 0;
  const recentProducts = products.slice(0, 5);
  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="EXP 6 / COMMAND CENTER"
        title="Dashboard"
        description="Live command center for your product database, inventory health and backend services."
        action={
          <div className="connection dashboard-connection">
            <span className={online ? "dot online" : "dot waiting"} />
            {online ? "API Online" : "API Waiting"}
          </div>
        }
      />

      <div className="metrics-grid">
        <Metric icon="▣" label="TOTAL PRODUCTS" value={total} description="Products in database" />
        <Metric icon="✓" label="ACTIVE PRODUCTS" value={activeCount} description={`${healthPercent}% currently active`} />
        <Metric icon="!" label="LOW STOCK" value={lowStock} description="Products with 1–10 units" />
        <Metric icon="₹" label="AVG PRICE" value={formatPrice(averagePrice)} description="Average product price" />
      </div>

      <div className="dashboard-live-grid">
        <section className="panel dashboard-health-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">INVENTORY HEALTH</span>
              <h2>Database Snapshot</h2>
            </div>
            <span className="dashboard-live-tag">LIVE</span>
          </div>

          <div className="dashboard-health-meter">
            <div className="dashboard-health-circle">
              <strong>{healthPercent}%</strong>
              <span>ACTIVE</span>
            </div>

            <div className="dashboard-health-details">
              <div><span><i className="dash-dot green" /> Active</span><strong>{activeCount}</strong></div>
              <div><span><i className="dash-dot red" /> Inactive</span><strong>{inactiveCount}</strong></div>
              <div><span><i className="dash-dot orange" /> Low stock</span><strong>{lowStock}</strong></div>
              <div><span><i className="dash-dot purple" /> Out of stock</span><strong>{outOfStock}</strong></div>
            </div>
          </div>

          <div className="dashboard-inventory-total">
            <span>Total inventory units</span>
            <strong>{Number(totalStock || 0).toLocaleString("en-IN")}</strong>
          </div>
        </section>

        <section className="panel dashboard-category-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CATEGORY MIX</span>
              <h2>Product Distribution</h2>
            </div>
            <button className="dashboard-text-button" onClick={() => navigate("analytics")}>
              View analytics →
            </button>
          </div>

          <div className="dashboard-category-list">
            {categoryBreakdown.slice(0, 5).map((item, index) => {
              const max = Math.max(...categoryBreakdown.map((entry) => entry.count), 1);
              return (
                <div className="dashboard-category-row" key={item.name}>
                  <div className="dashboard-category-label">
                    <span>{item.name}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className="dashboard-category-track">
                    <div
                      className={`dashboard-category-fill tone-${index}`}
                      style={{ width: `${Math.max((item.count / max) * 100, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!categoryBreakdown.length && <div className="dashboard-empty">No category data available.</div>}
          </div>
        </section>
      </div>

      <div className="dashboard-main-grid">
        <section className="panel dashboard-products-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CURRENT DATA</span>
              <h2>Recent Products</h2>
            </div>
            <button className="dashboard-text-button" onClick={() => navigate("records")}>
              Open records →
            </button>
          </div>

          <div className="dashboard-product-list">
            {recentProducts.map((product) => (
              <div className="dashboard-product-row" key={product.id}>
                <div className="dashboard-product-icon">◆</div>
                <div className="dashboard-product-info">
                  <strong>{product.name || "Unnamed Product"}</strong>
                  <span>{product.category || "Other"}</span>
                </div>
                <div className="dashboard-product-stock">
                  <strong>{product.stock ?? 0}</strong>
                  <span>STOCK</span>
                </div>
                <div className={`dashboard-product-status ${product.active ? "active" : "inactive"}`}>
                  {product.active ? "ACTIVE" : "INACTIVE"}
                </div>
              </div>
            ))}
            {!recentProducts.length && <div className="dashboard-empty">No products loaded.</div>}
          </div>
        </section>

        <section className="panel dashboard-top-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SALES PERFORMANCE</span>
              <h2>Top Products</h2>
            </div>
            <span className="dashboard-mini-badge">TOP 5</span>
          </div>

          <div className="dashboard-top-list">
            {topProducts.slice(0, 5).map((product, index) => (
              <div className="dashboard-top-row" key={product.id || index}>
                <span className="dashboard-rank">0{index + 1}</span>
                <div>
                  <strong>{product.name || "Unnamed Product"}</strong>
                  <span>{product.category || "Other"}</span>
                </div>
                <strong className="dashboard-sold">{Number(product.totalSold ?? 0)}</strong>
              </div>
            ))}
            {!topProducts.length && <div className="dashboard-empty">No sales data available.</div>}
          </div>
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="panel overview-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SYSTEM OVERVIEW</span>
              <h2>EXP 6 Architecture</h2>
            </div>
            <span className={online ? "status-pill online-pill" : "status-pill"}>
              {online ? "RUNNING" : "WAITING"}
            </span>
          </div>

          <div className="health-list">
            <HealthItem
              name="Spring Boot API"
              value={online ? "Backend responding on port 8081" : "Start backend on port 8081"}
              online={online}
            />
            <HealthItem name="Pagination & Sorting" value="Spring Data Pageable" online />
            <HealthItem name="Caching" value="Spring Cache / Ehcache" online />
            <HealthItem name="AI / RAG" value="EXP 6 local knowledge base" online />
          </div>
        </section>

        <section className="panel concepts-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">QUICK ACCESS</span>
              <h2>Explore the Experiment</h2>
            </div>
          </div>

          <div className="feature-grid">
            <FeatureCard icon="▣" title="Product Records" description="Browse, search, sort and paginate products." onClick={() => navigate("records")} />
            <FeatureCard icon="◒" title="Analytics" description="View live product and inventory insights." onClick={() => navigate("analytics")} />
            <FeatureCard icon="✦" title="AI / RAG" description="Ask questions from the EXP 6 knowledge base." onClick={() => navigate("ai")} />
            <FeatureCard icon="◫" title="Performance" description="Inspect API latency and optimization concepts." onClick={() => navigate("performance")} />
            <FeatureCard icon="◇" title="Database" description="Explore N+1, JOIN FETCH and native SQL." onClick={() => navigate("database")} />
          </div>
        </section>
      </div>

      <div className="dashboard-note panel">
        <div className="feature-icon">✦</div>
        <div>
          <strong>EXP 6 Command Center</strong>
          <p>Live product statistics, inventory health, category distribution and backend status are connected to the current Spring Boot API.</p>
        </div>
      </div>
    </div>
  );
}

function RecordsPage({
  products,
  page,
  size,
  sort,
  totalPages,
  totalElements,
  loading,
  error,
  setPage,
  setSize,
  setSort,
  searchKeyword,
  setSearchKeyword,
  onView,
  onEdit,
  onDelete,
  selectedProduct,
  setSelectedProduct,
  productEditor,
  setProductEditor,
  productSaveLoading,
  productSaveError,
  setProductSaveError,
  saveProduct,
  onAdd,
  productCreator,
  setProductCreator,
  productCreateLoading,
  productCreateError,
  setProductCreateError,
  createProduct,
}) {
  const [tableSearch, setTableSearch] = useState(searchKeyword || "");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    setTableSearch(searchKeyword || "");
  }, [searchKeyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = tableSearch.trim();
      if (normalized !== (searchKeyword || "")) {
        setSearchKeyword(normalized);
        setPage(0);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [tableSearch, searchKeyword, setSearchKeyword, setPage]);

  // Search is handled by Spring Boot. These additional filters refine
  // the currently loaded/search-result page without changing CRUD behavior.
  const categories = [...new Set(
    products.map((product) => product.category).filter(Boolean)
  )].sort();

  const filteredProducts = products.filter((product) => {
    const stock = Number(product.stock ?? 0);
    const price = Number(product.price ?? 0);

    if (categoryFilter !== "all" && product.category !== categoryFilter) {
      return false;
    }

    if (stockFilter === "in-stock" && stock <= 0) return false;
    if (stockFilter === "out-of-stock" && stock > 0) return false;
    if (stockFilter === "low-stock" && (stock <= 0 || stock > 10)) return false;

    if (lowStockOnly && (stock <= 0 || stock > 10)) return false;

    if (maxPrice !== "" && price > Number(maxPrice)) return false;

    return true;
  });

  const activeCount = products.filter((product) => product.active).length;
  const inactiveCount = products.length - activeCount;
  const categoryCount = new Set(
    products.map((product) => product.category).filter(Boolean)
  ).size;

  const categoryIcon = (category = "") => {
    const value = category.toLowerCase();
    if (value.includes("electronics")) return "▣";
    if (value.includes("sports")) return "✦";
    if (value.includes("home")) return "⌂";
    if (value.includes("access")) return "◆";
    return "●";
  };

  const categoryClass = (category = "") => {
    const value = category.toLowerCase();
    if (value.includes("electronics")) return "blue";
    if (value.includes("sports")) return "orange";
    if (value.includes("home")) return "purple";
    if (value.includes("access")) return "gold";
    return "teal";
  };

  const formatPrice = (price) => {
    const number = Number(price);
    if (Number.isNaN(number)) return `₹${price ?? "0"}`;
    return `₹${number.toLocaleString("en-IN")}`;
  };

  return (
    <div className="records-modern-page">
      <style>{`
        .records-modern-page {
          --rm-bg: #080817;
          --rm-panel: rgba(17, 20, 52, .72);
          --rm-panel-2: rgba(10, 12, 31, .78);
          --rm-line: rgba(143, 153, 255, .14);
          --rm-text: #f4f5ff;
          --rm-muted: #8f91b0;
          --rm-lime: #eaff25;
          --rm-purple: #9d62ff;
          --rm-blue: #318bff;
          --rm-green: #51efb0;
          --rm-red: #ff6675;
          min-height: calc(100vh - 100px);
          padding: 30px 38px 38px;
          color: var(--rm-text);
          background:
            radial-gradient(circle at 78% 18%, rgba(92, 73, 255, .15), transparent 28%),
            radial-gradient(circle at 94% 84%, rgba(146, 63, 255, .18), transparent 30%),
            linear-gradient(135deg, #09091c 0%, #09091b 48%, #0c0b25 100%);
          border-radius: 22px;
        }

        .rm-topline {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 26px;
        }

        .rm-eyebrow {
          color: #898ba9;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .rm-title {
          margin: 0;
          font-size: clamp(34px, 4vw, 52px);
          line-height: .98;
          letter-spacing: -.045em;
          font-weight: 850;
        }

        .rm-title span {
          background: linear-gradient(100deg, #fff 12%, #a873ff 72%, #dbb7ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .rm-subtitle {
          margin: 11px 0 0;
          max-width: 700px;
          color: var(--rm-muted);
          font-size: 14px;
        }

        .rm-total-badge {
          flex: 0 0 auto;
          padding: 13px 17px;
          border: 1px solid rgba(234,255,37,.2);
          border-radius: 14px;
          background: rgba(234,255,37,.05);
          color: #f4f5ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .1em;
          box-shadow: 0 0 30px rgba(234,255,37,.05);
        }

        .rm-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .rm-metric {
          position: relative;
          overflow: hidden;
          min-height: 112px;
          padding: 18px;
          border: 1px solid var(--rm-line);
          border-radius: 17px;
          background: linear-gradient(145deg, rgba(27,31,75,.75), rgba(10,12,31,.74));
          box-shadow: inset 0 1px rgba(255,255,255,.03), 0 14px 40px rgba(0,0,0,.14);
        }

        .rm-metric::after {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          right: -35px;
          bottom: -50px;
          border-radius: 50%;
          background: var(--metric-glow, rgba(157,98,255,.18));
          filter: blur(18px);
        }

        .rm-metric-head {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #9c9eba;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .rm-metric-icon {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #fff;
          background: rgba(157,98,255,.18);
          border: 1px solid rgba(157,98,255,.25);
          font-size: 17px;
        }

        .rm-metric-value {
          margin-top: 13px;
          font-size: 27px;
          font-weight: 850;
          letter-spacing: -.03em;
        }

        .rm-metric-note {
          margin-top: 3px;
          color: #7d809f;
          font-size: 11px;
        }

        .rm-shell {
          border: 1px solid rgba(135,146,255,.18);
          border-radius: 19px;
          background: linear-gradient(145deg, rgba(16,19,49,.78), rgba(7,9,24,.88));
          box-shadow: 0 24px 70px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.03);
          overflow: hidden;
        }

        .rm-toolbar {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 17px;
          border-bottom: 1px solid rgba(139,147,255,.12);
          background: rgba(10,12,31,.42);
        }

        .rm-live {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 150px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .09em;
          color: #e9ebff;
          text-transform: uppercase;
        }

        .rm-live-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #51efb0;
          box-shadow: 0 0 14px #51efb0;
        }

        .rm-search {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .rm-search input {
          width: 100%;
          box-sizing: border-box;
          height: 43px;
          padding: 0 15px 0 40px;
          border: 1px solid rgba(139,147,255,.2);
          border-radius: 11px;
          outline: none;
          color: #fff;
          background: rgba(7,9,26,.78);
          transition: .2s ease;
        }

        .rm-search input:focus {
          border-color: rgba(157,98,255,.7);
          box-shadow: 0 0 0 3px rgba(157,98,255,.1);
        }

        .rm-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #767998;
          pointer-events: none;
        }

        .rm-control {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #898ca9;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .1em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .rm-select {
          height: 43px;
          padding: 0 13px;
          border: 1px solid rgba(139,147,255,.2);
          border-radius: 11px;
          outline: none;
          color: #f4f5ff;
          background: #12152e;
          font-weight: 700;
          cursor: pointer;
        }

        .rm-table-wrap { overflow-x: auto; }

        .rm-table {
          min-width: 920px;
        }

        .rm-row {
          display: grid;
          grid-template-columns: 72px minmax(270px, 2.4fr) minmax(145px, 1.1fr) 105px 95px 115px 115px;
          align-items: center;
          min-height: 66px;
          padding: 0 16px;
          column-gap: 12px;
          border-bottom: 1px solid rgba(139,147,255,.09);
        }

        .rm-row.head {
          min-height: 44px;
          background: rgba(35,43,105,.45);
          color: #a8acd2;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .11em;
          text-transform: uppercase;
        }

        .rm-row.data { transition: background .2s ease; }
        .rm-row.data:hover { background: rgba(87,80,184,.08); }

        .rm-id {
          color: #d9dafe;
          font-weight: 800;
          font-size: 13px;
        }

        .rm-product {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .rm-product-thumb {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #fff;
          font-size: 17px;
          background: linear-gradient(145deg, #343a5e, #171a38);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: inset 0 1px rgba(255,255,255,.08);
        }

        .rm-product-info { min-width: 0; }
        .rm-product-name {
          color: #f5f5ff;
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rm-product-desc {
          margin-top: 3px;
          color: #777a9a;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rm-category {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 7px;
          padding: 7px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          border: 1px solid currentColor;
          background: rgba(255,255,255,.035);
          white-space: nowrap;
        }
        .rm-category.blue { color: #5eacff; }
        .rm-category.orange { color: #ffbd4f; }
        .rm-category.purple { color: #bd8cff; }
        .rm-category.gold { color: #ffd84f; }
        .rm-category.teal { color: #5de3cf; }

        .rm-price { font-weight: 850; font-size: 13px; }
        .rm-stock {
          display: inline-flex;
          justify-content: center;
          width: fit-content;
          min-width: 39px;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(79,88,151,.18);
          border: 1px solid rgba(130,142,230,.14);
          color: #e8e9ff;
          font-size: 11px;
          font-weight: 800;
        }

        .rm-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .07em;
        }
        .rm-status::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .rm-status.active { color: #59efb2; background: rgba(81,239,176,.09); }
        .rm-status.active::before { background: #59efb2; box-shadow: 0 0 9px #59efb2; }
        .rm-status.inactive { color: #ff7785; background: rgba(255,102,117,.09); }
        .rm-status.inactive::before { background: #ff6675; box-shadow: 0 0 9px #ff6675; }

        .rm-actions { display: flex; gap: 7px; }
        .rm-action {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          border: 1px solid rgba(133,144,235,.16);
          background: rgba(31,35,76,.52);
          color: #aeb3dc;
          font-size: 14px;
        }
        .rm-action.blue { color: #4ca9ff; }
        .rm-action.gold { color: #f5d13c; }
        .rm-action.red { color: #ff6474; }

        .rm-empty {
          min-height: 230px;
          display: grid;
          place-items: center;
          color: #7f829f;
          text-align: center;
          padding: 30px;
        }
        .rm-loader {
          width: 30px;
          height: 30px;
          margin: 0 auto 12px;
          border-radius: 50%;
          border: 3px solid rgba(157,98,255,.18);
          border-top-color: #a873ff;
          animation: rm-spin .8s linear infinite;
        }
        @keyframes rm-spin { to { transform: rotate(360deg); } }

        .rm-error {
          margin: 12px 16px 0;
          padding: 11px 13px;
          border: 1px solid rgba(255,102,117,.2);
          border-radius: 10px;
          color: #ff9aa5;
          background: rgba(255,70,90,.07);
          font-size: 12px;
        }

        .rm-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 17px;
          color: #777b9e;
          font-size: 12px;
        }

        .rm-pages { display: flex; align-items: center; gap: 7px; }
        .rm-page-btn {
          min-width: 39px;
          height: 39px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid rgba(136,146,235,.18);
          background: rgba(25,29,65,.6);
          color: #c9cbea;
          font-weight: 800;
          cursor: pointer;
          transition: .18s ease;
        }
        .rm-page-btn:hover:not(:disabled) { transform: translateY(-1px); border-color: rgba(157,98,255,.5); }
        .rm-page-btn.current { color: #0a0b17; background: var(--rm-lime); border-color: var(--rm-lime); }
        .rm-page-btn:disabled { opacity: .35; cursor: not-allowed; }

        @media (max-width: 1100px) {
          .rm-metrics { grid-template-columns: repeat(2, 1fr); }
          .rm-toolbar { flex-wrap: wrap; }
          .rm-search { order: 3; flex-basis: 100%; }
        }
        @media (max-width: 700px) {
          .records-modern-page { padding: 22px 14px; }
          .rm-topline { flex-direction: column; }
          .rm-metrics { grid-template-columns: 1fr; }
          .rm-toolbar { align-items: stretch; }
          .rm-live { min-width: auto; }
          .rm-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="rm-topline">
        <div>
          <div className="rm-eyebrow">EXP 6 / DATA RECORDS</div>
          <h1 className="rm-title">Product <span>Records</span></h1>
          <p className="rm-subtitle">
            Paginated and sortable product data retrieved from Spring Data JPA.
          </p>
        </div>
        <div className="rm-total-badge">{totalElements} RECORDS</div>
      </div>

      <div className="rm-metrics">
        <div className="rm-metric" style={{ "--metric-glow": "rgba(157,98,255,.2)" }}>
          <div className="rm-metric-head"><span className="rm-metric-icon">▣</span> Total Records</div>
          <div className="rm-metric-value">{totalElements}</div>
          <div className="rm-metric-note">Products in database</div>
        </div>
        <div className="rm-metric" style={{ "--metric-glow": "rgba(81,239,176,.18)" }}>
          <div className="rm-metric-head"><span className="rm-metric-icon">✓</span> Active Products</div>
          <div className="rm-metric-value">{activeCount}</div>
          <div className="rm-metric-note">On the current page</div>
        </div>
        <div className="rm-metric" style={{ "--metric-glow": "rgba(255,102,117,.18)" }}>
          <div className="rm-metric-head"><span className="rm-metric-icon">×</span> Inactive</div>
          <div className="rm-metric-value">{inactiveCount}</div>
          <div className="rm-metric-note">On the current page</div>
        </div>
        <div className="rm-metric" style={{ "--metric-glow": "rgba(49,139,255,.18)" }}>
          <div className="rm-metric-head"><span className="rm-metric-icon">≋</span> Categories</div>
          <div className="rm-metric-value">{categoryCount}</div>
          <div className="rm-metric-note">On the current page</div>
        </div>
      </div>

      <div className="rm-shell">
        <div className="rm-toolbar">
          <div className="rm-live"><span className="rm-live-dot" /> Live Database</div>

          <button
            type="button"
            className="rm-add-product"
            onClick={onAdd}
          >
            + Add Product
          </button>

          <div className={`rm-search ${searchKeyword ? "is-searching" : ""}`}>
            <span className="rm-search-icon">⌕</span>
            <input
              value={tableSearch}
              onChange={(event) => setTableSearch(event.target.value)}
              placeholder="Search all products, categories..."
              aria-label="Search all products"
            />
            {tableSearch && (
              <button
                type="button"
                className="rm-search-clear"
                onClick={() => {
                  setTableSearch("");
                  setSearchKeyword("");
                  setPage(0);
                }}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <label className="rm-control">
            Sort by
            <select
              className="rm-select"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(0);
              }}
            >
              <option value="id,desc">ID ↓</option>
              <option value="id,asc">ID ↑</option>
              <option value="name,asc">Name A–Z</option>
              <option value="name,desc">Name Z–A</option>
              <option value="price,asc">Price ↑</option>
              <option value="price,desc">Price ↓</option>
              <option value="totalSold,desc">Popularity</option>
            </select>
          </label>

          <label className="rm-control">
            Page size
            <select
              className="rm-select"
              value={size}
              onChange={(event) => {
                setSize(Number(event.target.value));
                setPage(0);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </label>

          <label className="rm-control">
            Category
            <select
              className="rm-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="rm-control">
            Stock
            <select
              className="rm-select"
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
            >
              <option value="all">All</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </label>

          <label className="rm-control rm-price-filter">
            Max Price
            <input
              className="rm-price-input"
              type="number"
              min="0"
              placeholder="₹"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>

          <button
            type="button"
            className={`rm-low-stock-toggle ${lowStockOnly ? "active" : ""}`}
            onClick={() => setLowStockOnly((value) => !value)}
            title="Show products with stock from 1 to 10"
          >
            ⚠ Low Stock
          </button>
          {(categoryFilter !== "all" || stockFilter !== "all" || lowStockOnly || maxPrice !== "") && (
            <button
              type="button"
              className="rm-reset-filters"
              onClick={() => {
                setCategoryFilter("all");
                setStockFilter("all");
                setLowStockOnly(false);
                setMaxPrice("");
              }}
            >
              Reset
            </button>
          )}
        </div>

        {error && <div className="rm-error">⚠ {error}</div>}

        <div className="rm-table-wrap">
          <div className="rm-table">
            <div className="rm-row head">
              <span>ID</span>
              <span>PRODUCT</span>
              <span>CATEGORY</span>
              <span>PRICE</span>
              <span>STOCK</span>
              <span>STATUS</span>
              <span>ACTIONS</span>
            </div>

            {loading ? (
              <div className="rm-empty">
                <div>
                  <div className="rm-loader" />
                  Loading products...
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rm-empty">
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⌕</div>
                  {searchKeyword || categoryFilter !== "all" || stockFilter !== "all" || lowStockOnly || maxPrice !== ""
                    ? "No products match the current filters."
                    : "No products found."}
                </div>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const category = product.category || "Other";
                const categoryTone = categoryClass(category);

                return (
                  <div className="rm-row data" key={product.id}>
                    <span className="rm-id">#{product.id}</span>

                    <div className="rm-product">
                      <div className="rm-product-thumb">{categoryIcon(category)}</div>
                      <div className="rm-product-info">
                        <div className="rm-product-name">{product.name || "Unnamed Product"}</div>
                        <div className="rm-product-desc">{product.description || "No description available."}</div>
                      </div>
                    </div>

                    <span>
                      <span className={`rm-category ${categoryTone}`}>
                        {categoryIcon(category)} {category}
                      </span>
                    </span>

                    <strong className="rm-price">{formatPrice(product.price)}</strong>

                    <span
                      className={`rm-stock ${
                        Number(product.stock ?? 0) === 0
                          ? "out"
                          : Number(product.stock ?? 0) <= 10
                          ? "low"
                          : ""
                      }`}
                      title={
                        Number(product.stock ?? 0) === 0
                          ? "Out of stock"
                          : Number(product.stock ?? 0) <= 10
                          ? "Low stock"
                          : "Healthy stock"
                      }
                    >
                      {product.stock ?? 0}
                    </span>

                    <span className={`rm-status ${product.active ? "active" : "inactive"}`}>
                      {product.active ? "ACTIVE" : "INACTIVE"}
                    </span>

                    <div className="rm-actions">
                      <button className="rm-action blue" title="View" type="button" onClick={() => onView(product)}>◉</button>
                      <button className="rm-action gold" title="Edit" type="button" onClick={() => onEdit(product)}>✎</button>
                      <button className="rm-action red" title="Delete" type="button" onClick={() => onDelete(product.id)}>⌫</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rm-footer">
          <div>
            Showing {products.length ? page * size + 1 : 0} to {Math.min(page * size + filteredProducts.length, totalElements)} of {totalElements} products
          </div>

          <div className="rm-pages">
            <button
              className="rm-page-btn"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              ←
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`rm-page-btn ${page === pageNumber ? "current" : ""}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber + 1}
              </button>
            ))}

            <button
              className="rm-page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      {selectedProduct && (
        <div onClick={() => setSelectedProduct(null)} style={{position:"fixed",inset:0,zIndex:100,display:"grid",placeItems:"center",padding:24,background:"rgba(3,3,12,.72)",backdropFilter:"blur(8px)"}}>
          <div onClick={(e)=>e.stopPropagation()} style={{width:"min(560px,100%)",padding:24,border:"1px solid rgba(143,153,255,.22)",borderRadius:18,background:"linear-gradient(145deg,#171a3d,#090a20)",boxShadow:"0 30px 100px rgba(0,0,0,.55)",color:"#f5f5ff"}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start"}}>
              <div><small style={{color:"#8588a5",letterSpacing:".16em"}}>PRODUCT DETAILS</small><h2 style={{margin:"8px 0 0"}}>{selectedProduct.name}</h2></div>
              <button type="button" onClick={()=>setSelectedProduct(null)} style={{background:"transparent",border:0,color:"#aaa",fontSize:22}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:20}}>
              {[["ID",`#${selectedProduct.id}`],["CATEGORY",selectedProduct.category||"Other"],["PRICE",formatPrice(selectedProduct.price)],["STOCK",selectedProduct.stock??0],["STATUS",selectedProduct.active?"ACTIVE":"INACTIVE"]].map(([label,value])=><div key={label} style={{padding:12,border:"1px solid rgba(143,153,255,.1)",borderRadius:10,background:"rgba(7,8,23,.4)"}}><small style={{display:"block",color:"#727692",fontSize:8,letterSpacing:".12em"}}>{label}</small><strong style={{display:"block",marginTop:6,fontSize:11}}>{value}</strong></div>)}
            </div>
            <p style={{color:"#8588a4",fontSize:11,lineHeight:1.6,marginTop:18}}>{selectedProduct.description||"No description available."}</p>
            <div style={{display:"flex",justifyContent:"flex-end",gap:9,marginTop:20}}>
              <button
                type="button"
                className="lemon-button"
                onClick={() => {
                  onEdit(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Edit Product
              </button>
              <button type="button" onClick={()=>onDelete(selectedProduct.id)} style={{height:40,padding:"0 15px",borderRadius:9,border:"1px solid rgba(255,102,117,.25)",background:"rgba(255,102,117,.08)",color:"#ff7885",fontWeight:700}}>Delete</button>
            </div>
          </div>
        </div>
      )}
      </div>
          {productCreator && (
            <div
              className="rm-modal-backdrop"
              onClick={() => !productCreateLoading && setProductCreator(null)}
            >
              <div
                className="rm-modal rm-editor-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="rm-modal-head">
                  <div>
                    <small>CREATE PRODUCT</small>
                    <h2>Add New Product</h2>
                    <p>Fill in the product details to create a new product in the inventory.</p>
                  </div>
                  <button
                    type="button"
                    disabled={productCreateLoading}
                    onClick={() => setProductCreator(null)}
                  >
                    ×
                  </button>
                </div>

                {productCreateError && (
                  <div className="rm-inline-error">{productCreateError}</div>
                )}

                <div className="rm-edit-grid">
                  <label>
                    <span className="rm-field-label">PRODUCT NAME <b>*</b></span>
                    <input
                      autoFocus
                      placeholder="e.g. Wireless Headphones"
                      value={productCreator.name}
                      onChange={(event) =>
                        setProductCreator((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span className="rm-field-label">CATEGORY <b>*</b></span>
                    <input
                      placeholder="e.g. Electronics"
                      value={productCreator.category}
                      onChange={(event) =>
                        setProductCreator((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span className="rm-field-label">PRICE (₹) <b>*</b></span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={productCreator.price}
                      onChange={(event) =>
                        setProductCreator((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span className="rm-field-label">STOCK <b>*</b></span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={productCreator.stock}
                      onChange={(event) =>
                        setProductCreator((current) => ({
                          ...current,
                          stock: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="rm-edit-wide">
                    <span className="rm-field-label">DESCRIPTION</span>
                    <textarea
                      placeholder="Add a short product description..."
                      value={productCreator.description}
                      onChange={(event) =>
                        setProductCreator((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="rm-toggle">
                    <input
                      type="checkbox"
                      checked={productCreator.active}
                      onChange={(event) =>
                        setProductCreator((current) => ({
                          ...current,
                          active: event.target.checked,
                        }))
                      }
                    />
                    <span>Product is active</span>
                  </label>
                </div>

                <div className="rm-modal-actions">
                  <button
                    type="button"
                    className="rm-secondary-btn"
                    disabled={productCreateLoading}
                    onClick={() => setProductCreator(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="lemon-button"
                    disabled={productCreateLoading}
                    onClick={createProduct}
                  >
                    {productCreateLoading ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {productEditor && (
        <div
          className="rm-modal-backdrop"
          onClick={() => !productSaveLoading && setProductEditor(null)}
        >
          <div
            className="rm-modal rm-editor-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rm-modal-head">
              <div>
                <small>EDIT PRODUCT</small>
                <h2>{productEditor.name || "Product"}</h2>
              </div>
              <button
                type="button"
                disabled={productSaveLoading}
                onClick={() => setProductEditor(null)}
              >
                ×
              </button>
            </div>

            {productSaveError && (
              <div className="rm-inline-error">
                {productSaveError}
              </div>
            )}

            <div className="rm-edit-grid">
              <label>
                PRODUCT NAME
                <input
                  value={productEditor.name}
                  onChange={(event) =>
                    setProductEditor((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                CATEGORY
                <input
                  value={productEditor.category}
                  onChange={(event) =>
                    setProductEditor((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                PRICE
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productEditor.price}
                  onChange={(event) =>
                    setProductEditor((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                STOCK
                <input
                  type="number"
                  min="0"
                  value={productEditor.stock}
                  onChange={(event) =>
                    setProductEditor((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="rm-edit-wide">
                DESCRIPTION
                <textarea
                  value={productEditor.description}
                  onChange={(event) =>
                    setProductEditor((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="rm-toggle">
                <input
                  type="checkbox"
                  checked={productEditor.active}
                  onChange={(event) =>
                    setProductEditor((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                />
                <span>Product is active</span>
              </label>
            </div>

            <div className="rm-modal-actions">
              <button
                type="button"
                className="rm-secondary-btn"
                disabled={productSaveLoading}
                onClick={() => setProductEditor(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="lemon-button"
                disabled={productSaveLoading}
                onClick={saveProduct}
              >
                {productSaveLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
</div>


  );
}

/* =========================
   ANALYTICS
========================= */

function Analytics({
  total,
  active = 0,
  inactive = 0,
  categories = 0,
  lowStock = 0,
  outOfStock = 0,
  averagePrice = 0,
  totalStock = 0,
  categoryBreakdown = [],
  topProducts = [],
}) {
  const maxCategory = Math.max(...categoryBreakdown.map((item) => item.count), 1);
  const maxSold = Math.max(...topProducts.map((item) => Number(item?.totalSold ?? 0)), 1);

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  return (
    <>
      <PageHeader
        eyebrow="EXP 6 / ANALYTICS"
        title="Product Analytics"
        description="Live statistics calculated from the products stored in PostgreSQL."
      />

      <div className="analytics-live-grid">
        <div className="analytics-live-card">
          <span className="analytics-live-icon">▣</span>
          <small>TOTAL PRODUCTS</small>
          <strong>{total}</strong>
          <p>Records currently stored</p>
        </div>

        <div className="analytics-live-card green">
          <span className="analytics-live-icon">✓</span>
          <small>ACTIVE</small>
          <strong>{active}</strong>
          <p>{total ? Math.round((active / total) * 100) : 0}% of database</p>
        </div>

        <div className="analytics-live-card red">
          <span className="analytics-live-icon">!</span>
          <small>LOW STOCK</small>
          <strong>{lowStock}</strong>
          <p>1–10 units remaining</p>
        </div>

        <div className="analytics-live-card blue">
          <span className="analytics-live-icon">₹</span>
          <small>AVERAGE PRICE</small>
          <strong>{formatPrice(averagePrice)}</strong>
          <p>Across priced products</p>
        </div>
      </div>

      <div className="analytics-dashboard-grid">
        <div className="panel analytics-chart-panel">
          <div className="analytics-panel-head">
            <div>
              <small>CATEGORY DISTRIBUTION</small>
              <h2>Products by Category</h2>
            </div>
            <span className="analytics-live-tag">LIVE</span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="analytics-empty">No category data available.</div>
          ) : (
            <div className="analytics-bars">
              {categoryBreakdown.map((item) => (
                <div className="analytics-bar-row" key={item.name}>
                  <div className="analytics-bar-label">
                    <span>{item.name}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{ width: `${Math.max((item.count / maxCategory) * 100, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel analytics-stock-panel">
          <div className="analytics-panel-head">
            <div>
              <small>INVENTORY HEALTH</small>
              <h2>Stock Overview</h2>
            </div>
          </div>

          <div className="stock-ring">
            <div>
              <strong>{totalStock}</strong>
              <span>UNITS</span>
            </div>
          </div>

          <div className="stock-legend">
            <div><i className="stock-dot healthy" /><span>Healthy stock</span><strong>{Math.max(total - lowStock - outOfStock, 0)}</strong></div>
            <div><i className="stock-dot warning" /><span>Low stock</span><strong>{lowStock}</strong></div>
            <div><i className="stock-dot danger" /><span>Out of stock</span><strong>{outOfStock}</strong></div>
          </div>
        </div>

        <div className="panel analytics-wide-panel">
          <div className="analytics-panel-head">
            <div>
              <small>SALES PERFORMANCE</small>
              <h2>Top Products by Total Sold</h2>
            </div>
            <span className="analytics-live-tag">TOP 5</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="analytics-empty">No sales data available.</div>
          ) : (
            <div className="top-products-list">
              {topProducts.map((product, index) => {
                const sold = Number(product?.totalSold ?? 0);
                return (
                  <div className="top-product-row" key={product?.id ?? index}>
                    <span className="top-rank">0{index + 1}</span>
                    <div className="top-product-main">
                      <div className="top-product-title">{product?.name || "Unnamed Product"}</div>
                      <div className="top-product-track">
                        <div className="top-product-fill" style={{ width: `${Math.max((sold / maxSold) * 100, sold ? 5 : 0)}%` }} />
                      </div>
                    </div>
                    <strong>{sold}</strong>
                    <small>SOLD</small>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="panel analytics-summary-panel">
          <small>DATABASE SNAPSHOT</small>
          <h2>Current State</h2>

          <div className="analytics-summary-row">
            <span>Active products</span>
            <strong>{active}</strong>
          </div>
          <div className="analytics-summary-row">
            <span>Inactive products</span>
            <strong>{inactive}</strong>
          </div>
          <div className="analytics-summary-row">
            <span>Categories</span>
            <strong>{categories}</strong>
          </div>
          <div className="analytics-summary-row">
            <span>Total inventory units</span>
            <strong>{totalStock}</strong>
          </div>
          <div className="analytics-summary-row">
            <span>Average product price</span>
            <strong>{formatPrice(averagePrice)}</strong>
          </div>
        </div>
      </div>
    </>
  );
}


/* =========================
   AI
========================= */

function AIAssistant({
  messages,
  input,
  setInput,
  askAI,
  productStats,
  products,
}) {
  const suggestions = [
    "What is pagination in EXP 6?",
    "Explain the N+1 problem",
    "How does JOIN FETCH help?",
    "How does caching work?",
    "How many products are active?",
  ];

  const assistantMessages = messages.filter((message) => message.role === "assistant");
  const latestAssistant = [...assistantMessages].reverse()[0];
  const groundedCount = assistantMessages.filter((message) => (message.confidence ?? 0) >= 60).length;
  const indexSize = knowledgeBase.length;

  function confidenceLabel(value) {
    if (value >= 85) return "HIGH CONFIDENCE";
    if (value >= 60) return "GROUNDED";
    return "LOW MATCH";
  }

  function clearChat() {
    setInput("");
    // Parent state is intentionally reset through a browser event so the existing
    // local assistant remains lightweight and does not require an external service.
    window.dispatchEvent(new CustomEvent("exp6-clear-rag"));
  }

  return (
    <>
      <PageHeader
        eyebrow="EXP 6 / INTELLIGENCE LAB"
        title="AI + RAG Command Center"
        description="Query the local EXP 6 knowledge base, combine retrieved project facts with live product data, and inspect why each answer was selected."
        action={
          <div className="rag-status rag-status-live">
            <i />
            LOCAL RAG READY
          </div>
        }
      />

      <div className="rag-overview-grid">
        <div className="panel rag-overview-card">
          <span>KNOWLEDGE ENTRIES</span>
          <strong>{indexSize}</strong>
          <small>Indexed EXP 6 concepts</small>
        </div>
        <div className="panel rag-overview-card">
          <span>GROUNDED ANSWERS</span>
          <strong>{groundedCount}</strong>
          <small>Matched retrieval responses</small>
        </div>
        <div className="panel rag-overview-card">
          <span>PRODUCT CONTEXT</span>
          <strong>{productStats?.total ?? 0}</strong>
          <small>Live database products</small>
        </div>
        <div className="panel rag-overview-card">
          <span>INDEX STATUS</span>
          <strong className="rag-ready-value">READY</strong>
          <small>Keyword retrieval active</small>
        </div>
      </div>

      <div className="ai-layout rag-command-grid">
        <div className="panel chat-panel rag-chat-panel">
          <div className="ai-chat-top">
            <div>
              <span className="eyebrow">KNOWLEDGE ASSISTANT</span>
              <h2>EXP 6 Intelligence</h2>
              <p className="rag-subtitle">Grounded answers only · local retrieval · no external model required</p>
            </div>
            <div className="rag-chat-actions">
              <span className="status-pill online-pill">
                <span className="dot online" />
                GROUNDED
              </span>
              <button type="button" className="rag-clear-btn" onClick={clearChat}>CLEAR</button>
            </div>
          </div>

          <div className="ai-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="ai-suggestion"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="messages rag-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-icon">
                  {message.role === "assistant" ? "✦" : "K"}
                </div>

                <div className="message-content">
                  <div className="message-bubble">
                    {message.text.split("\n").map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        {lineIndex < message.text.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>

                  {message.role === "assistant" && (
                    <div className="rag-answer-meta">
                      <span className={`rag-confidence ${confidenceLabel(message.confidence).toLowerCase().replace(/ /g, "-")}`}>
                        {message.confidence != null ? `${message.confidence}%` : "—"} · {confidenceLabel(message.confidence ?? 0)}
                      </span>
                      {message.productContext && <span className="rag-context-tag">LIVE PRODUCT CONTEXT</span>}
                    </div>
                  )}

                  {message.source && (
                    <small className="source">SOURCE · {message.source}</small>
                  )}

                  {message.role === "assistant" && message.retrieved?.length > 0 && (
                    <div className="retrieval-mini-list">
                      {message.retrieved.map((item) => (
                        <div className="retrieval-mini-card" key={`${item.title}-${item.source}`}>
                          <span>RETRIEVED</span>
                          <strong>{item.title}</strong>
                          <small>{item.source}</small>
                          <b>{item.score} MATCH</b>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form className="ai-input rag-input" onSubmit={askAI}>
            <div className="rag-input-icon">✦</div>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about pagination, caching, JOIN FETCH, products..."
            />
            <button className="lemon-button" type="submit">Ask ✦</button>
          </form>
        </div>

        <div className="rag-side-column">
          <div className="panel rag-panel rag-pipeline-panel">
            <div className="rag-panel-heading">
              <div>
                <small>RETRIEVAL PIPELINE</small>
                <h2>How RAG works</h2>
              </div>
              <span className="rag-index-chip">{indexSize} DOCS</span>
            </div>

            <RagStep number="01" title="Question" text="Your question is normalized before retrieval begins." />
            <RagStep number="02" title="Retrieve" text="Relevant EXP 6 entries are selected using keyword and title scoring." />
            <RagStep number="03" title="Ground" text="Retrieved material is combined with live product statistics when relevant." />
            <RagStep number="04" title="Source" text="The response exposes its matched project source and confidence." />
          </div>

          <div className="panel rag-context-panel">
            <div className="rag-panel-heading">
              <div>
                <small>LIVE CONTEXT</small>
                <h2>Product Intelligence</h2>
              </div>
              <span className="rag-live-dot"><i /> LIVE</span>
            </div>

            <div className="rag-context-grid">
              <div><span>Total</span><strong>{productStats?.total ?? 0}</strong></div>
              <div><span>Active</span><strong>{productStats?.active ?? 0}</strong></div>
              <div><span>Low Stock</span><strong>{productStats?.lowStock ?? 0}</strong></div>
              <div><span>Categories</span><strong>{productStats?.categories ?? 0}</strong></div>
            </div>

            <div className="rag-context-products">
              <span>VISIBLE PRODUCTS</span>
              {products?.slice(0, 4).map((product) => (
                <div key={product.id} className="rag-product-line">
                  <span>{product.name || "Unnamed Product"}</span>
                  <b>{product.category || "—"}</b>
                </div>
              ))}
              {!products?.length && <small>No product context loaded yet.</small>}
            </div>
          </div>

          {latestAssistant && (
            <div className="panel rag-latest-panel">
              <small>LATEST RETRIEVAL</small>
              <h3>{latestAssistant.confidence != null ? `${latestAssistant.confidence}%` : "—"} confidence</h3>
              <p>{latestAssistant.source || "EXP 6 Knowledge Base"}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* =========================
   PERFORMANCE
========================= */


function Performance({
  online,
  latency,
  samples = [],
  measure,
}) {
  const [running, setRunning] = useState(false);

  const successful = samples.filter((sample) => sample.status === "Success");
  const values = samples.map((sample) => Number(sample.latency)).filter(Number.isFinite);
  const average = values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : null;
  const minimum = values.length ? Math.min(...values) : null;
  const maximum = values.length ? Math.max(...values) : null;
  const successRate = samples.length
    ? Math.round((successful.length / samples.length) * 100)
    : null;

  function performanceLabel(value) {
    if (value == null) return "NO DATA";
    if (value < 200) return "FAST";
    if (value < 500) return "MODERATE";
    return "SLOW";
  }

  async function runBenchmark() {
    if (running || !measure) return;
    setRunning(true);
    try {
      for (let index = 0; index < 5; index += 1) {
        try {
          await measure();
        } catch {
          // Failed samples are already recorded by measureProductApi().
        }
      }
    } finally {
      setRunning(false);
    }
  }

  const latestStatus = performanceLabel(latency);
  const maxChart = Math.max(...values, 200);

  return (
    <>
      <PageHeader
        eyebrow="EXP 6 / PERFORMANCE LAB"
        title="API Performance Monitor"
        description="Measure the live Spring Boot product API, inspect response history, and demonstrate the effect of optimized reads and caching."
      />

      <div className="performance-live-actions">
        <div>
          <span className="performance-live-dot" />
          <strong>{online ? "Backend Connected" : "Backend Offline"}</strong>
          <small>localhost:8081 · GET /api/products</small>
        </div>
        <button
          type="button"
          className="primary-btn performance-run-btn"
          onClick={runBenchmark}
          disabled={running}
        >
          {running ? "RUNNING 5 SAMPLES..." : "RUN 5-SAMPLE BENCHMARK"}
        </button>
      </div>

      <div className="performance-kpi-grid">
        <div className="panel performance-kpi">
          <span>LATEST LATENCY</span>
          <strong>{latency ?? "—"}<em>{latency != null ? "ms" : ""}</em></strong>
          <b className={`performance-status ${latestStatus.toLowerCase()}`}>{latestStatus}</b>
        </div>
        <div className="panel performance-kpi">
          <span>AVERAGE</span>
          <strong>{average ?? "—"}<em>{average != null ? "ms" : ""}</em></strong>
          <small>{samples.length} measured sample{samples.length === 1 ? "" : "s"}</small>
        </div>
        <div className="panel performance-kpi">
          <span>MIN / MAX</span>
          <strong>{minimum ?? "—"}<em>{minimum != null ? ` / ${maximum} ms` : ""}</em></strong>
          <small>Observed response range</small>
        </div>
        <div className="panel performance-kpi">
          <span>SUCCESS RATE</span>
          <strong>{successRate ?? "—"}<em>{successRate != null ? "%" : ""}</em></strong>
          <small>HTTP request completion</small>
        </div>
      </div>

      <div className="performance-dashboard-grid">
        <div className="panel performance-main performance-monitor-panel">
          <div className="performance-section-head">
            <div>
              <small>RESPONSE PROFILE</small>
              <h2>Live API response history</h2>
            </div>
            <span className="performance-count">{samples.length}/6 samples</span>
          </div>

          <div className="performance-chart">
            {samples.length ? samples.map((sample, index) => {
              const value = Number(sample.latency) || 0;
              const height = Math.max(10, Math.round((value / maxChart) * 100));
              const status = performanceLabel(value);
              return (
                <div className="performance-chart-item" key={`${sample.time}-${index}`} title={`${sample.time} · ${value} ms`}>
                  <b>{value}<small>ms</small></b>
                  <div className="performance-chart-track">
                    <i className={status.toLowerCase()} style={{ height: `${height}%` }} />
                  </div>
                  <span>{sample.time}</span>
                </div>
              );
            }) : (
              <div className="performance-chart-empty">
                <strong>No benchmark samples yet.</strong>
                <span>Run the benchmark to measure the real API response time.</span>
              </div>
            )}
          </div>

          <div className="performance-history">
            {samples.length ? [...samples].reverse().map((sample, index) => (
              <div className="performance-sample" key={`${sample.time}-history-${index}`}>
                <div className="performance-sample-head">
                  <span>{sample.time}</span>
                  <b>{sample.latency} ms · {sample.status}</b>
                </div>
                <div className="performance-sample-track">
                  <i style={{ width: `${Math.min(100, Math.max(4, (Number(sample.latency) / Math.max(maxChart, 1)) * 100))}%` }} />
                </div>
              </div>
            )) : (
              <div className="performance-empty">
                <strong>Waiting for measurement.</strong> The history appears here after the first request.
              </div>
            )}
          </div>
        </div>

        <div className="panel performance-side">
          <div className="performance-section-head">
            <div>
              <small>OPTIMIZATION LAB</small>
              <h2>Reference profile</h2>
            </div>
          </div>

          <PerformanceBar name="Cold database" value="620 ms" width="88%" />
          <PerformanceBar name="JOIN FETCH" value="310 ms" width="54%" />
          <PerformanceBar
            name="Cached benchmark"
            value={latency != null ? `${latency} ms` : "—"}
            width={latency != null ? `${Math.min(100, Math.max(8, latency / 7))}%` : "8%"}
          />

          <div className="performance-method-card">
            <span>MEASUREMENT TARGET</span>
            <strong>Product REST API</strong>
            <p>Page 0 · 5 records · current sort order · browser-to-Spring-Boot round trip.</p>
          </div>

          <div className="performance-status-list">
            <div><i className="fast" /><span>Fast</span><b>&lt; 200 ms</b></div>
            <div><i className="moderate" /><span>Moderate</span><b>200–499 ms</b></div>
            <div><i className="slow" /><span>Slow</span><b>500+ ms</b></div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================
   DATABASE
========================= */

function Database() {
  const [activeDemo, setActiveDemo] = useState("n1");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runs, setRuns] = useState([]);

  const demos = {
    n1: {
      label: "N+1 QUERY",
      title: "N + 1 Queries",
      description:
        "A parent list is loaded first, then an additional query may run for every related record. As N grows, database round trips grow too.",
      count: "1 + N",
      status: "PROBLEM",
      statusClass: "bad",
      result: "5 parent records can produce about 6 database queries.",
      code: `SELECT * FROM tasks;\n-- additional related query for each task`,
      estimated: 620,
      impact: "High round-trip overhead",
    },
    join: {
      label: "JOIN FETCH",
      title: "Optimized Fetch",
      description:
        "JOIN FETCH retrieves the parent records and their related data together, reducing unnecessary round trips caused by lazy related-entity loading.",
      count: "1",
      status: "OPTIMIZED",
      statusClass: "good",
      result: "5 parent records can be loaded with approximately 1 query.",
      code: `SELECT DISTINCT t\nFROM Task t\nLEFT JOIN FETCH t.comments`,
      estimated: 310,
      impact: "Reduced database round trips",
    },
    native: {
      label: "NATIVE SQL",
      title: "Latest Records",
      description:
        "A native SQL query lets the database perform an explicit operation such as returning the latest five records.",
      count: "1",
      status: "DIRECT SQL",
      statusClass: "good",
      result: "The database directly returns the latest five records.",
      code: `SELECT *\nFROM tasks\nORDER BY created_at DESC\nLIMIT 5;`,
      estimated: 180,
      impact: "Focused database operation",
    },
    cache: {
      label: "CACHE",
      title: "Cached Reads",
      description:
        "Spring Cache can reuse a previously retrieved result and avoid repeating the same database read until the cache is invalidated.",
      count: "0*",
      status: "CACHE HIT",
      statusClass: "good",
      result: "A cache hit can serve the result without another database query.",
      code: `@Cacheable("tasks")\n\n@CacheEvict(\n  value = "tasks",\n  allEntries = true\n)`,
      estimated: 48,
      impact: "Database read avoided on hit",
    },
  };

  const current = demos[activeDemo];

  function runDemo() {
    setRunning(true);
    setResult(null);

    const started = performance.now();
    window.setTimeout(() => {
      const elapsed = Math.max(1, Math.round(performance.now() - started));
      setRunning(false);
      setResult({
        message: current.result,
        elapsed,
      });
      setRuns((previous) => [
        {
          id: Date.now(),
          type: current.label,
          latency: current.estimated,
          status: current.status,
        },
        ...previous,
      ].slice(0, 5));
    }, 550);
  }

  const maxEstimated = Math.max(...Object.values(demos).map((demo) => demo.estimated));
  const improvement = Math.max(
    0,
    Math.round(((demos.n1.estimated - current.estimated) / demos.n1.estimated) * 100)
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="EXP 6 / DATABASE LAB"
        title="Database Optimization"
        description="Explore query patterns, compare estimated execution profiles, and understand how fewer database round trips improve the data path."
      />

      <div className="database-kpi-grid">
        <div className="panel database-kpi-card">
          <small>BASELINE</small>
          <strong>{demos.n1.estimated}<span> ms</span></strong>
          <p>N+1 reference profile</p>
        </div>
        <div className="panel database-kpi-card">
          <small>CURRENT PROFILE</small>
          <strong>{current.estimated}<span> ms</span></strong>
          <p>{current.status.toLowerCase()} reference</p>
        </div>
        <div className="panel database-kpi-card">
          <small>ROUND TRIPS</small>
          <strong>{current.count}</strong>
          <p>illustrative query count</p>
        </div>
        <div className="panel database-kpi-card">
          <small>RUNS</small>
          <strong>{runs.length}<span>/ 5</span></strong>
          <p>demonstrations recorded</p>
        </div>
      </div>

      <div className="db-demo-tabs">
        {Object.entries(demos).map(([id, demo]) => (
          <button
            key={id}
            type="button"
            className={`db-demo-tab ${activeDemo === id ? "active" : ""}`}
            onClick={() => {
              setActiveDemo(id);
              setResult(null);
            }}
          >
            {demo.label}
          </button>
        ))}
      </div>

      <div className="database-grid database-interactive-grid database-v2-grid">
        <div className={`panel query-card ${current.statusClass === "good" ? "optimized" : ""}`}>
          <span className={`query-label ${current.statusClass === "good" ? "optimized-label" : ""}`}>
            {current.label}
          </span>

          <div className="db-card-heading">
            <div>
              <h2>{current.title}</h2>
              <p>{current.description}</p>
            </div>
            <span className={`query-status ${current.statusClass}`}>{current.status}</span>
          </div>

          <div className={`query-visual ${current.statusClass === "good" ? "good-flow" : "danger-flow"}`}>
            <b>APP</b><i /><b>DB</b><i /><b>{current.count}</b>
          </div>

          <div className="db-profile-meter">
            <div className="db-profile-head">
              <span>ESTIMATED PROFILE</span>
              <b>{current.estimated} ms</b>
            </div>
            <div className="db-profile-track">
              <span style={{ width: `${Math.max(7, (current.estimated / maxEstimated) * 100)}%` }} />
            </div>
            <small>{current.impact}</small>
          </div>

          <button type="button" className="lemon-button db-run-button" onClick={runDemo} disabled={running}>
            {running ? "Running..." : "Run Demonstration ↗"}
          </button>

          {result && (
            <div className="db-result">
              <div>
                <span>RESULT</span>
                <strong>{result.message}</strong>
              </div>
              <b>{result.elapsed} ms</b>
            </div>
          )}
        </div>

        <div className="panel code-panel">
          <div className="code-panel-heading">
            <div>
              <small>IMPLEMENTATION</small>
              <h3>{current.title}</h3>
            </div>
            <span className={`query-status ${current.statusClass}`}>{current.status}</span>
          </div>

          <pre>{current.code}</pre>

          <div className="db-explanation">
            <div>
              <span>01</span>
              <section>
                <strong>Database round trips</strong>
                <small>
                  {activeDemo === "n1"
                    ? "The number of related queries can grow with N."
                    : "The optimized example keeps database access focused."}
                </small>
              </section>
            </div>
            <div>
              <span>02</span>
              <section>
                <strong>Why it matters</strong>
                <small>Fewer unnecessary round trips can reduce latency and database load.</small>
              </section>
            </div>
            <div>
              <span>03</span>
              <section>
                <strong>EXP 6 connection</strong>
                <small>Pagination, caching and optimized reads work together in the Spring Boot data path.</small>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="database-bottom-grid database-v2-bottom">
        <div className="panel database-flow-card">
          <small>QUERY FLOW</small>
          <h2>Before vs After</h2>
          <div className="flow-row bad-flow">
            <span>N+1</span>
            <div className="flow-nodes"><b>Parent</b><i /><b>Child 1</b><i /><b>Child 2</b><i /><b>Child N</b></div>
          </div>
          <div className="flow-row good-flow-row">
            <span>FETCH</span>
            <div className="flow-nodes"><b>Parent</b><i /><b>JOIN</b><i /><b>Related Data</b></div>
          </div>
        </div>

        <div className="panel database-concept-card">
          <small>REFERENCE PROFILE</small>
          <h2>Optimization impact</h2>
          {Object.entries(demos).map(([id, demo]) => (
            <div className="db-compare-row" key={id}>
              <span>{demo.label}</span>
              <div className="db-compare-track"><i style={{ width: `${Math.max(7, (demo.estimated / maxEstimated) * 100)}%` }} /></div>
              <b>{demo.estimated} ms</b>
            </div>
          ))}
          <div className="db-impact-note">
            <span>RELATIVE CHANGE</span>
            <strong>{improvement}% lower than the N+1 reference</strong>
          </div>
        </div>
      </div>

      <div className="panel database-history-card">
        <div className="database-history-head">
          <div>
            <small>RUN HISTORY</small>
            <h2>Recent demonstrations</h2>
          </div>
          <span>{runs.length ? `${runs.length} recorded` : "No runs yet"}</span>
        </div>
        {runs.length === 0 ? (
          <div className="database-empty">Run a demonstration above to populate the history.</div>
        ) : (
          <div className="database-run-list">
            {runs.map((run) => (
              <div className="database-run-row" key={run.id}>
                <span>{run.type}</span>
                <div className="database-run-line"><i style={{ width: `${Math.max(8, (run.latency / maxEstimated) * 100)}%` }} /></div>
                <b>{run.latency} ms</b>
                <em className={run.status === "PROBLEM" ? "bad" : "good"}>{run.status}</em>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}) {

  return (
    <div className="page-header">

      <div>

        <span className="eyebrow">
          {eyebrow}
        </span>

        <h1>
          {title}
        </h1>

        <p>
          {description}
        </p>

      </div>

      {action}

    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  description,
}) {

  return (
    <div className="metric-card">

      <div className="metric-icon">
        {icon}
      </div>

      <div>

        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>

        <span>
          {description}
        </span>

      </div>

    </div>
  );
}

function SystemRow({
  name,
  value,
  online,
}) {

  return (
    <div className="system-row">

      <i
        className={
          online ? "dot online" : "dot waiting"
        }
      />

      <span>
        {name}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

function HealthItem({
  name,
  value,
  online,
}) {

  return (
    <div className="health-item">

      <i
        className={
          online
            ? "dot online"
            : "dot waiting"
        }
      />

      <div>

        <strong>
          {name}
        </strong>

        <small>
          {value}
        </small>

      </div>

      <span>
        ●
      </span>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  onClick,
}) {

  return (
    <button
      className="feature-card"
      onClick={onClick}
    >

      <div className="feature-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <span>
        ↗
      </span>

    </button>
  );
}

function MiniFeature({
  icon,
  title,
  text,
}) {

  return (
    <div className="mini-feature">

      <div>
        {icon}
      </div>

      <section>

        <strong>
          {title}
        </strong>

        <small>
          {text}
        </small>

      </section>

    </div>
  );
}

function Concept({
  number,
  title,
  description,
  code,
}) {

  return (
    <div className="panel concept-card">

      <span>
        {number}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <code>
        {code}
      </code>

    </div>
  );
}

function RagStep({
  number,
  title,
  text,
}) {

  return (
    <div className="rag-step">

      <strong>
        {number}
      </strong>

      <div>

        <b>
          {title}
        </b>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}

function PerformanceBar({
  name,
  value,
  width,
}) {

  return (
    <div className="performance-bar">

      <div>
        <span>
          {name}
        </span>

        <b>
          {value}
        </b>
      </div>

      <i>
        <em
          style={{
            width,
          }}
        />
      </i>

    </div>
  );
}

export default App;
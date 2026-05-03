const architectureForm = document.querySelector("[data-architecture-form]");

if (architectureForm) {
  const pageLanguage = document.body.dataset.pageLanguage === "bg" ? "bg" : "en";
  const strings = {
    en: {
      pending: "To be defined",
      none: "Not selected yet",
      generated: "Generated",
      custom: "Custom",
      systemFallback: "Architecture draft",
      copied: "Brief copied.",
      buildLabel: "Build architecture",
      lanes: {
        channels: {
          label: "Channels",
          note: "Who or what enters the platform.",
        },
        edge: {
          label: "Edge and access",
          note: "Traffic control, ingress, and protective layers.",
        },
        network: {
          label: "Network",
          note: "Cloud, on-prem, VPC, zones, and connectivity.",
        },
        services: {
          label: "Services",
          note: "Application runtimes, workers, jobs, and compute.",
        },
        data: {
          label: "Data and integrations",
          note: "Databases, cache, messaging, and external systems.",
        },
        operations: {
          label: "Operations and governance",
          note: "Identity, monitoring, recovery, delivery, and AI enablement.",
        },
      },
      summary: {
        deployment: "Deployment",
        network: "Network",
        compute: "Compute",
        data: "Data",
        operations: "Operations",
        ai: "AI and training",
      },
      inspector: {
        emptyTitle: "Select a component",
        emptyBody:
          "Build the architecture, then click any component to rename it, explain what it does, or add more context for stakeholders.",
        inventoryEmpty: "No components yet. Build the architecture first.",
      },
      placeholder: {
        title: "Build the architecture from the answers.",
        body:
          "Answer the questions a senior architect would normally ask, then press Build. You can edit names, notes, and add more components after generation.",
      },
      stageStatus:
        "Build the architecture to generate a live preview. Open the full diagram to inspect zones, dependencies, and platform layers in detail.",
      actions: {
        editAnswers: "Edit answers",
        copyBrief: "Copy brief",
        removeComponent: "Remove component",
        addComponent: "Add component",
      },
      options: {
        business_goal: {
          sales: "Sales and lead generation",
          product: "Customer product or platform",
          ops: "Internal operations",
          data: "Analytics and reporting",
          ai: "AI-enabled experience",
          modernization: "Modernization or rescue",
        },
        deployment_model: {
          cloud: "Cloud",
          "on-prem": "On-prem",
          hybrid: "Hybrid",
          "saas-heavy": "SaaS-heavy",
        },
        primary_cloud: {
          aws: "AWS",
          azure: "Azure",
          gcp: "Google Cloud",
          oci: "OCI",
          private: "Private cloud",
          none: "No preferred cloud",
        },
        channels: {
          "public-site": "Public website",
          "web-app": "Web application",
          "ios-app": "iOS app",
          "android-app": "Android app",
          "internal-admin": "Internal admin",
          "partner-portal": "Partner portal",
          "public-api": "Public API",
          "ai-assistant": "AI assistant",
        },
        environments: {
          dev: "Dev",
          test: "Test",
          staging: "Staging",
          prod: "Production",
          dr: "DR",
        },
        network_topology: {
          "single-vpc": "Single VPC",
          "segmented-vpc": "Segmented VPC",
          "multi-vpc": "Multi-VPC",
          "hub-spoke": "Hub and spoke",
          "on-prem-core": "On-prem core",
          "hybrid-mesh": "Hybrid mesh",
        },
        subnet_pattern: {
          "public-private": "Public and private subnets",
          "private-only": "Private-only application subnets",
          "three-tier": "Three-tier segmentation",
          custom: "Custom segmentation",
        },
        ingress: {
          cdn: "CDN",
          waf: "WAF",
          "load-balancer": "Load balancer",
          "api-gateway": "API gateway",
          vpn: "VPN",
          "direct-connect": "Private link",
          bastion: "Bastion",
        },
        hosting: {
          vm: "EC2 or VMs",
          containers: "Containers",
          kubernetes: "Kubernetes",
          serverless: "Serverless",
          "managed-runtime": "Managed app platform",
        },
        autoscaling: {
          manual: "Manual scaling",
          scheduled: "Scheduled scaling",
          auto: "Autoscaling",
          mixed: "Mixed scaling model",
        },
        relational_db: {
          none: "No relational database",
          postgres: "Postgres",
          mysql: "MySQL",
          "sql-server": "SQL Server",
          oracle: "Oracle",
          aurora: "Aurora",
          "managed-mix": "Managed database mix",
        },
        cache_layer: {
          none: "No cache layer",
          redis: "Redis",
          memcached: "Memcached",
          "managed-cache": "Managed cache",
        },
        object_storage: {
          yes: "Object storage",
          no: "No object storage",
        },
        messaging: {
          queue: "Queue",
          "event-bus": "Event bus",
          stream: "Streaming",
        },
        data_services: {
          search: "Search",
          warehouse: "Warehouse",
          "bi-feed": "BI feeds",
        },
        identity: {
          sso: "SSO / IdP",
          iam: "IAM",
          rbac: "RBAC",
          secrets: "Secrets management",
        },
        ops: {
          monitoring: "Monitoring",
          logging: "Logging",
          tracing: "Tracing",
          siem: "SIEM",
          backup: "Backups",
          cicd: "CI/CD",
        },
        recovery_tier: {
          basic: "Basic recovery",
          standard: "Standard recovery",
          "active-passive": "Active-passive DR",
          "active-active": "Active-active",
        },
        ai_focus: {
          assistant: "AI assistant",
          rag: "RAG or retrieval",
          training: "AI training",
          governance: "AI governance",
        },
      },
      labels: {
        channelUsers: {
          "public-site": "Public visitors",
          "web-app": "Web users",
          "ios-app": "iOS users",
          "android-app": "Android users",
          "internal-admin": "Internal team",
          "partner-portal": "Partners",
          "public-api": "API consumers",
          "ai-assistant": "AI assistant",
        },
        chip: {
          channels: "Entry",
          edge: "Edge",
          network: "Network",
          services: "Runtime",
          data: "Data",
          operations: "Ops",
        },
        groups: {
          customerChannels: "Customer touchpoints",
          internalChannels: "Internal and partner access",
          programmaticChannels: "Programmatic entry",
          publicIngress: "Ingress and delivery",
          protectedAccess: "Protected access",
          networkCore: "Core network zone",
          hybridAccess: "Hybrid and private links",
          appTier: "Application tier",
          asyncWorkloads: "Jobs and async workloads",
          platformRuntime: "Platform runtime",
          transactionalData: "Transactional data",
          asyncData: "Messaging and flow",
          externalSystems: "External systems",
          analyticsAi: "Analytics and AI data",
          securityIdentity: "Security and identity",
          observability: "Observability",
          deliveryRecovery: "Delivery and resilience",
          aiEnablement: "AI enablement",
        },
      },
      brief: {
        title: "High-level architecture brief",
        system: "System",
        goal: "Goal",
        deployment: "Deployment",
        channels: "Channels",
        network: "Network",
        compute: "Compute",
        data: "Data and integrations",
        operations: "Operations",
        ai: "AI enablement",
        constraints: "Constraints",
        context: "Business context",
      },
      terraform: {
        statusEmpty: "Build the architecture to generate an example Terraform starter.",
        statusReady: "Example Terraform starter generated from the current answers and component inventory.",
        copy: "Copy Terraform",
        copied: "Terraform copied.",
        placeholder: "# Build the architecture to generate Terraform.\n",
      },
    },
    bg: {
      pending: "Ще се уточни",
      none: "Все още не е избрано",
      generated: "Генериран",
      custom: "Ръчен",
      systemFallback: "Архитектурен проект",
      copied: "Резюмето е копирано.",
      buildLabel: "Изгради архитектура",
      lanes: {
        channels: {
          label: "Канали",
          note: "Кой или какво влиза в платформата.",
        },
        edge: {
          label: "Достъп и защита",
          note: "Трафик, входни точки и защитни слоеве.",
        },
        network: {
          label: "Мрежа",
          note: "Cloud, on-prem, VPC, зони и свързаност.",
        },
        services: {
          label: "Услуги",
          note: "Приложения, workers, jobs и compute слоеве.",
        },
        data: {
          label: "Данни и интеграции",
          note: "Бази, cache, messaging и външни системи.",
        },
        operations: {
          label: "Операции и управление",
          note: "Идентичност, мониторинг, recovery, delivery и AI enablement.",
        },
      },
      summary: {
        deployment: "Модел",
        network: "Мрежа",
        compute: "Изпълнение",
        data: "Данни",
        operations: "Операции",
        ai: "AI и обучение",
      },
      inspector: {
        emptyTitle: "Изберете компонент",
        emptyBody:
          "Изградете архитектурата и после натиснете върху компонент, за да промените името му, да опишете какво прави или да добавите контекст за заинтересованите страни.",
        inventoryEmpty: "Все още няма компоненти. Първо изградете архитектурата.",
      },
      placeholder: {
        title: "Изградете архитектурата от отговорите.",
        body:
          "Отговорете на въпросите, които senior архитект би задал, после натиснете Build. След това можете да редактирате имена, бележки и да добавяте нови компоненти.",
      },
      stageStatus:
        "Изградете архитектурата, за да генерирате live preview. Отворете пълната диаграма, за да разгледате зоните, зависимостите и платформените слоеве в детайл.",
      actions: {
        editAnswers: "Редактирайте отговорите",
        copyBrief: "Копирайте резюмето",
        removeComponent: "Премахнете компонента",
        addComponent: "Добавете компонент",
      },
      options: {
        business_goal: {
          sales: "Продажби и запитвания",
          product: "Клиентски продукт или платформа",
          ops: "Вътрешни операции",
          data: "Анализи и отчети",
          ai: "AI функционалност",
          modernization: "Модернизация или rescue",
        },
        deployment_model: {
          cloud: "Cloud",
          "on-prem": "On-prem",
          hybrid: "Хибридно",
          "saas-heavy": "SaaS-heavy",
        },
        primary_cloud: {
          aws: "AWS",
          azure: "Azure",
          gcp: "Google Cloud",
          oci: "OCI",
          private: "Private cloud",
          none: "Без предпочитан cloud",
        },
        channels: {
          "public-site": "Публичен сайт",
          "web-app": "Уеб приложение",
          "ios-app": "iOS приложение",
          "android-app": "Android приложение",
          "internal-admin": "Вътрешен admin",
          "partner-portal": "Партньорски портал",
          "public-api": "Публично API",
          "ai-assistant": "AI асистент",
        },
        environments: {
          dev: "Dev",
          test: "Test",
          staging: "Staging",
          prod: "Production",
          dr: "DR",
        },
        network_topology: {
          "single-vpc": "Един VPC",
          "segmented-vpc": "Сегментиран VPC",
          "multi-vpc": "Multi-VPC",
          "hub-spoke": "Hub and spoke",
          "on-prem-core": "On-prem core",
          "hybrid-mesh": "Хибридна mesh мрежа",
        },
        subnet_pattern: {
          "public-private": "Публични и частни subnet-и",
          "private-only": "Само частни приложни subnet-и",
          "three-tier": "Тристепенна сегментация",
          custom: "Custom сегментация",
        },
        ingress: {
          cdn: "CDN",
          waf: "WAF",
          "load-balancer": "Load balancer",
          "api-gateway": "API gateway",
          vpn: "VPN",
          "direct-connect": "Private link",
          bastion: "Bastion",
        },
        hosting: {
          vm: "EC2 или VM",
          containers: "Контейнери",
          kubernetes: "Kubernetes",
          serverless: "Serverless",
          "managed-runtime": "Managed app платформа",
        },
        autoscaling: {
          manual: "Ръчно scaling",
          scheduled: "Планирано scaling",
          auto: "Autoscaling",
          mixed: "Смесен модел",
        },
        relational_db: {
          none: "Без релационна база",
          postgres: "Postgres",
          mysql: "MySQL",
          "sql-server": "SQL Server",
          oracle: "Oracle",
          aurora: "Aurora",
          "managed-mix": "Managed database mix",
        },
        cache_layer: {
          none: "Без cache слой",
          redis: "Redis",
          memcached: "Memcached",
          "managed-cache": "Managed cache",
        },
        object_storage: {
          yes: "Object storage",
          no: "Без object storage",
        },
        messaging: {
          queue: "Queue",
          "event-bus": "Event bus",
          stream: "Streaming",
        },
        data_services: {
          search: "Search",
          warehouse: "Warehouse",
          "bi-feed": "BI feeds",
        },
        identity: {
          sso: "SSO / IdP",
          iam: "IAM",
          rbac: "RBAC",
          secrets: "Secrets management",
        },
        ops: {
          monitoring: "Monitoring",
          logging: "Logging",
          tracing: "Tracing",
          siem: "SIEM",
          backup: "Backups",
          cicd: "CI/CD",
        },
        recovery_tier: {
          basic: "Базово възстановяване",
          standard: "Стандартно възстановяване",
          "active-passive": "Active-passive DR",
          "active-active": "Active-active",
        },
        ai_focus: {
          assistant: "AI асистент",
          rag: "RAG или retrieval",
          training: "AI обучение",
          governance: "AI governance",
        },
      },
      labels: {
        channelUsers: {
          "public-site": "Публични посетители",
          "web-app": "Уеб потребители",
          "ios-app": "iOS потребители",
          "android-app": "Android потребители",
          "internal-admin": "Вътрешен екип",
          "partner-portal": "Партньори",
          "public-api": "API клиенти",
          "ai-assistant": "AI асистент",
        },
        chip: {
          channels: "Вход",
          edge: "Достъп",
          network: "Мрежа",
          services: "Runtime",
          data: "Данни",
          operations: "Ops",
        },
        groups: {
          customerChannels: "Клиентски точки на достъп",
          internalChannels: "Вътрешен и партньорски достъп",
          programmaticChannels: "Програмен вход",
          publicIngress: "Вход и доставка",
          protectedAccess: "Защитен достъп",
          networkCore: "Основна мрежова зона",
          hybridAccess: "Хибридни и частни връзки",
          appTier: "Приложен слой",
          asyncWorkloads: "Jobs и async слоеве",
          platformRuntime: "Платформен runtime",
          transactionalData: "Транзакционни данни",
          asyncData: "Messaging и потоци",
          externalSystems: "Външни системи",
          analyticsAi: "Аналитични и AI данни",
          securityIdentity: "Сигурност и идентичност",
          observability: "Наблюдаемост",
          deliveryRecovery: "Delivery и устойчивост",
          aiEnablement: "AI enablement",
        },
      },
      brief: {
        title: "High-level архитектурно резюме",
        system: "Система",
        goal: "Цел",
        deployment: "Модел",
        channels: "Канали",
        network: "Мрежа",
        compute: "Изпълнение",
        data: "Данни и интеграции",
        operations: "Операции",
        ai: "AI enablement",
        constraints: "Ограничения",
        context: "Бизнес контекст",
      },
      terraform: {
        statusEmpty: "Изградете архитектурата, за да генерирате примерен Terraform starter.",
        statusReady: "Примерният Terraform starter е генериран от текущите отговори и component inventory-то.",
        copy: "Копирайте Terraform",
        copied: "Terraform е копиран.",
        placeholder: "# Изградете архитектурата, за да генерирате Terraform.\n",
      },
    },
  }[pageLanguage];

  const storageKey = "mycompany-architecture-builder";
  const laneOrder = ["channels", "edge", "network", "services", "data", "operations"];
  const summaryTargets = {
    deployment: document.querySelector("[data-architecture-summary='deployment']"),
    network: document.querySelector("[data-architecture-summary='network']"),
    compute: document.querySelector("[data-architecture-summary='compute']"),
    data: document.querySelector("[data-architecture-summary='data']"),
    operations: document.querySelector("[data-architecture-summary='operations']"),
    ai: document.querySelector("[data-architecture-summary='ai']"),
  };
  const summaryGrid = document.querySelector("[data-architecture-summary-grid]");
  const architectureStatus = document.querySelector("[data-architecture-status]");
  const architectureModal = document.querySelector("[data-architecture-modal]");
  const openDiagramTargets = Array.from(document.querySelectorAll("[data-open-architecture-modal]"));
  const closeDiagramTargets = Array.from(document.querySelectorAll("[data-close-architecture-modal]"));
  const zoomInButton = document.querySelector("[data-zoom-in]");
  const zoomOutButton = document.querySelector("[data-zoom-out]");
  const zoomFitButton = document.querySelector("[data-zoom-fit]");
  const zoomReadout = document.querySelector("[data-zoom-readout]");
  const diagramContexts = [
    {
      key: "preview",
      interactive: false,
      board: document.querySelector("[data-architecture-preview-board]"),
      links: document.querySelector("[data-architecture-preview-links]"),
      viewport: document.querySelector("[data-architecture-preview-viewport]"),
      canvas: document.querySelector("[data-architecture-preview-canvas]"),
      scaleWrap: document.querySelector("[data-architecture-preview-scale]"),
    },
    {
      key: "modal",
      interactive: true,
      board: document.querySelector("[data-architecture-modal-board]"),
      links: document.querySelector("[data-architecture-modal-links]"),
      viewport: document.querySelector("[data-architecture-modal-viewport]"),
      canvas: document.querySelector("[data-architecture-modal-canvas]"),
      scaleWrap: document.querySelector("[data-architecture-modal-scale]"),
    },
  ].filter((context) => context.board && context.links && context.viewport && context.canvas && context.scaleWrap);
  const inventoryTarget = document.querySelector("[data-node-list]");
  const nodeTitleTarget = document.querySelector("[data-node-title]");
  const nodeEmptyTarget = document.querySelector("[data-node-empty]");
  const nodeForm = document.querySelector("[data-node-form]");
  const addNodeForm = document.querySelector("[data-add-node-form]");
  const copyBriefButton = document.querySelector("[data-copy-brief]");
  const copyTerraformButton = document.querySelector("[data-copy-terraform]");
  const scrollFormButton = document.querySelector("[data-scroll-form]");
  const removeNodeButton = document.querySelector("[data-remove-node]");
  const terraformOutput = document.querySelector("[data-terraform-output]");
  const terraformStatus = document.querySelector("[data-terraform-status]");
  const outputSection = document.querySelector("#architecture-output");

  let currentModel = null;
  let selectedNodeId = null;
  let nodeCounter = 0;
  let customCounter = 0;
  let modalScale = 1;
  let previousActiveElement = null;

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Ignore storage errors and keep the builder functional.
      }
    },
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const getText = (name) => {
    const field = architectureForm.elements.namedItem(name);
    return typeof field?.value === "string" ? field.value.trim() : "";
  };

  const getRadio = (name) => architectureForm.querySelector(`input[name="${name}"]:checked`)?.value || "";
  const getChecked = (name) =>
    Array.from(architectureForm.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
  const getNumber = (name, fallback = 0) => {
    const parsed = Number.parseInt(getText(name), 10);
    return Number.isFinite(parsed) ? Math.max(parsed, 0) : fallback;
  };
  const parseList = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  const unique = (items) => Array.from(new Set(items.filter(Boolean)));
  const labelFor = (group, value) => strings.options[group]?.[value] || value;
  const labelsFor = (group, values) => values.map((value) => labelFor(group, value));
  const joinLabels = (labels) => labels.filter(Boolean).join(" • ");
  const hclString = (value) => JSON.stringify(String(value ?? ""));
  const slugify = (value, fallback = "mycompany_stack") =>
    String(value || fallback)
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "_")
      .replaceAll(/^_+|_+$/g, "")
      .replaceAll(/_{2,}/g, "_") || fallback;
  const quoteList = (items) => `[${items.map((item) => hclString(item)).join(", ")}]`;
  const firstRegion = (answers) => parseList(answers.regions)[0] || (pageLanguage === "bg" ? "eu-central-1" : "eu-central-1");
  const createId = (prefix = "node") => {
    nodeCounter += 1;
    return `${prefix}-${nodeCounter}`;
  };

  const createNode = ({ lane, title, meta = "", note = "", tags = [], kind = "service", generated = true }) => ({
    id: createId(generated ? "node" : "custom"),
    lane,
    title,
    meta,
    note,
    tags: unique(tags),
    kind,
    generated,
    connections: [],
  });

  const laneGroupOrder = {
    channels: ["customerChannels", "internalChannels", "programmaticChannels"],
    edge: ["publicIngress", "protectedAccess"],
    network: ["networkCore", "hybridAccess"],
    services: ["appTier", "platformRuntime", "asyncWorkloads"],
    data: ["transactionalData", "asyncData", "analyticsAi", "externalSystems"],
    operations: ["securityIdentity", "observability", "deliveryRecovery", "aiEnablement"],
  };

  const classifyNodeGroup = (node) => {
    const haystack = `${node.title} ${node.meta} ${node.note} ${node.tags.join(" ")}`.toLowerCase();

    if (node.lane === "channels") {
      if (/api|assistant/.test(haystack)) {
        return "programmaticChannels";
      }

      if (/internal|partner|team|admin|office/.test(haystack)) {
        return "internalChannels";
      }

      return "customerChannels";
    }

    if (node.lane === "edge") {
      return /vpn|bastion|private|protect|secure/.test(haystack) || node.kind === "security"
        ? "protectedAccess"
        : "publicIngress";
    }

    if (node.lane === "network") {
      return /hybrid|private link|site-to-site|vpn|on-prem/.test(haystack) ? "hybridAccess" : "networkCore";
    }

    if (node.lane === "services") {
      if (/worker|job|async|scheduler/.test(haystack)) {
        return "asyncWorkloads";
      }

      if (/kubernetes|container|runtime|serverless|cluster|platform/.test(haystack)) {
        return "platformRuntime";
      }

      return "appTier";
    }

    if (node.lane === "data") {
      if (node.kind === "integration" || /external/.test(haystack)) {
        return "externalSystems";
      }

      if (/queue|event|stream|async/.test(haystack)) {
        return "asyncData";
      }

      if (/search|warehouse|bi|vector|retrieval|analytics|ai/.test(haystack)) {
        return "analyticsAi";
      }

      return "transactionalData";
    }

    if (node.lane === "operations") {
      if (node.kind === "enablement" || /ai|training|assistant|guardrail|governance/.test(haystack)) {
        return "aiEnablement";
      }

      if (/monitor|logging|tracing|siem|observ/.test(haystack)) {
        return "observability";
      }

      if (/backup|recovery|cicd|delivery|disaster|failover/.test(haystack)) {
        return "deliveryRecovery";
      }

      return "securityIdentity";
    }

    return "appTier";
  };

  const buildLaneGroups = (laneId, nodes) => {
    const grouped = new Map();

    nodes.forEach((node) => {
      const groupId = classifyNodeGroup(node);
      if (!grouped.has(groupId)) {
        grouped.set(groupId, []);
      }
      grouped.get(groupId).push(node);
    });

    const preferredOrder = laneGroupOrder[laneId] || [];
    const orderedKeys = [
      ...preferredOrder.filter((groupId) => grouped.has(groupId)),
      ...Array.from(grouped.keys()).filter((groupId) => !preferredOrder.includes(groupId)),
    ];

    return orderedKeys.map((groupId) => ({
      id: groupId,
      label: strings.labels.groups[groupId] || groupId,
      nodes: grouped.get(groupId),
    }));
  };

  const readAnswers = () => ({
    systemName: getText("system_name"),
    namingPrefix: getText("naming_prefix"),
    businessGoal: getRadio("business_goal"),
    channels: getChecked("channels"),
    businessContext: getText("business_context"),
    deploymentModel: getText("deployment_model"),
    primaryCloud: getText("primary_cloud"),
    regions: getText("regions"),
    environments: getChecked("environments"),
    networkTopology: getText("network_topology"),
    azCount: Math.max(getNumber("az_count", 2), 1),
    subnetPattern: getText("subnet_pattern"),
    ingress: getChecked("ingress"),
    vpcNotes: getText("vpc_notes"),
    hosting: getChecked("hosting"),
    appNodeCount: getNumber("app_node_count", 2),
    workerNodeCount: getNumber("worker_node_count", 1),
    utilityNodeCount: getNumber("utility_node_count", 1),
    autoscaling: getText("autoscaling"),
    computeNotes: getText("compute_notes"),
    relationalDb: getText("relational_db"),
    relationalDbCount: getNumber("relational_db_count", 1),
    cacheLayer: getText("cache_layer"),
    objectStorage: getText("object_storage"),
    messaging: getChecked("messaging"),
    dataServices: getChecked("data_services"),
    integrationList: parseList(getText("integration_list")),
    identity: getChecked("identity"),
    ops: getChecked("ops"),
    recoveryTier: getText("recovery_tier"),
    compliance: getText("compliance"),
    aiFocus: getChecked("ai_focus"),
    trainingAudience: getText("training_audience"),
    constraints: getText("constraints"),
  });

  const applyAnswers = (answers) => {
    Object.entries(answers).forEach(([name, value]) => {
      const field = architectureForm.elements.namedItem(name);

      if (!field) {
        return;
      }

      if (typeof RadioNodeList !== "undefined" && field instanceof RadioNodeList) {
        if (Array.isArray(value)) {
          Array.from(field).forEach((input) => {
            input.checked = value.includes(input.value);
          });
        } else {
          Array.from(field).forEach((input) => {
            input.checked = input.value === value;
          });
        }
        return;
      }

      if (field.type === "checkbox") {
        field.checked = Array.isArray(value) ? value.includes(field.value) : Boolean(value);
        return;
      }

      if (typeof value === "string" || typeof value === "number") {
        field.value = String(value);
      }
    });
  };

  const buildSummaryValues = (answers) => {
    const deployment = [
      labelFor("deployment_model", answers.deploymentModel),
      answers.deploymentModel !== "on-prem" ? labelFor("primary_cloud", answers.primaryCloud) : "",
    ]
      .filter(Boolean)
      .join(" • ");
    const network = [
      labelFor("network_topology", answers.networkTopology),
      answers.azCount ? `${answers.azCount} AZ` : "",
      labelFor("subnet_pattern", answers.subnetPattern),
    ]
      .filter(Boolean)
      .join(" • ");
    const compute = [
      joinLabels(labelsFor("hosting", answers.hosting)),
      answers.hosting.includes("vm")
        ? `${answers.appNodeCount + answers.workerNodeCount + answers.utilityNodeCount} VM${answers.appNodeCount + answers.workerNodeCount + answers.utilityNodeCount === 1 ? "" : "s"}`
        : "",
    ]
      .filter(Boolean)
      .join(" • ");
    const data = [
      answers.relationalDb !== "none" ? labelFor("relational_db", answers.relationalDb) : "",
      answers.cacheLayer !== "none" ? labelFor("cache_layer", answers.cacheLayer) : "",
      answers.objectStorage === "yes" ? labelFor("object_storage", answers.objectStorage) : "",
      ...labelsFor("messaging", answers.messaging),
      ...labelsFor("data_services", answers.dataServices),
    ]
      .filter(Boolean)
      .join(" • ");
    const operations = [
      ...labelsFor("identity", answers.identity),
      ...labelsFor("ops", answers.ops),
      labelFor("recovery_tier", answers.recoveryTier),
    ]
      .filter(Boolean)
      .join(" • ");
    const ai = [...labelsFor("ai_focus", answers.aiFocus), answers.trainingAudience].filter(Boolean).join(" • ");

    return {
      deployment: deployment || strings.pending,
      network: network || strings.pending,
      compute: compute || strings.pending,
      data: data || strings.pending,
      operations: operations || strings.pending,
      ai: ai || strings.none,
    };
  };

  const updateLiveSummary = () => {
    const summary = buildSummaryValues(readAnswers());
    Object.entries(summaryTargets).forEach(([key, target]) => {
      if (target) {
        target.textContent = summary[key];
      }
    });
  };

  const syncLanes = (model) => {
    model.lanes = laneOrder
      .map((laneId) => {
        const nodes = model.nodes.filter((node) => node.lane === laneId);
        if (!nodes.length) {
          return null;
        }
        return {
          id: laneId,
          label: strings.lanes[laneId].label,
          note: strings.lanes[laneId].note,
          nodes,
          groups: buildLaneGroups(laneId, nodes),
        };
      })
      .filter(Boolean);
  };

  const addSequentialConnections = (nodes) => {
    nodes.forEach((node, index) => {
      if (nodes[index + 1] && !node.connections.includes(nodes[index + 1].id)) {
        node.connections.push(nodes[index + 1].id);
      }
    });
  };

  const connectNodes = (source, targets) => {
    if (!source) {
      return;
    }

    targets.filter(Boolean).forEach((target) => {
      if (!source.connections.includes(target.id)) {
        source.connections.push(target.id);
      }
    });
  };

  const connectChains = (fromNodes, toNodes, limit = 2) => {
    if (!fromNodes.length || !toNodes.length) {
      return;
    }

    const sources = fromNodes.slice(0, Math.max(1, Math.min(limit, fromNodes.length)));
    const targets = toNodes.slice(0, Math.max(1, Math.min(limit + 1, toNodes.length)));

    sources.forEach((source, index) => {
      const target = targets[Math.min(index, targets.length - 1)];
      connectNodes(source, [target]);
    });
  };

  const addNumberedNodes = (collection, config) => {
    const visibleCount = Math.min(Math.max(config.count, 0), config.visibleLimit || 4);
    const extra = Math.max(config.count - visibleCount, 0);

    for (let index = 0; index < visibleCount; index += 1) {
      const suffix = String(index + 1).padStart(2, "0");
      collection.push(
        createNode({
          lane: config.lane,
          title: `${config.baseTitle} ${suffix}`,
          meta: config.meta,
          note: config.note,
          tags: config.tags,
          kind: config.kind,
        })
      );
    }

    if (extra > 0) {
      collection.push(
        createNode({
          lane: config.lane,
          title: `${config.baseTitle} +${extra}`,
          meta: pageLanguage === "bg" ? "Допълнителни компоненти" : "Additional components",
          note:
            pageLanguage === "bg"
              ? `Още ${extra} компонента извън видимата high-level група.`
              : `${extra} more components beyond the visible high-level group.`,
          tags: config.tags,
          kind: config.kind,
        })
      );
    }
  };

  const buildArchitectureModel = (answers) => {
    const nodes = [];
    const prefix = answers.namingPrefix ? `${answers.namingPrefix.trim()}-` : "";
    const channelValues = answers.channels.length ? answers.channels : ["public-site"];
    const ingressValues = answers.ingress.length
      ? answers.ingress
      : channelValues.some((channel) => ["public-site", "web-app", "public-api", "ai-assistant"].includes(channel))
        ? ["cdn", "waf", "load-balancer"]
        : [];
    const environmentLabels = labelsFor("environments", answers.environments);
    const usesCloud = ["cloud", "hybrid", "saas-heavy"].includes(answers.deploymentModel);
    const usesOnPrem = ["on-prem", "hybrid"].includes(answers.deploymentModel);
    const cloudLabel = labelFor("primary_cloud", answers.primaryCloud);

    channelValues.forEach((channel) => {
      nodes.push(
        createNode({
          lane: "channels",
          title: strings.labels.channelUsers[channel] || labelFor("channels", channel),
          meta: labelFor("channels", channel),
          note:
            channel === "public-site"
              ? pageLanguage === "bg"
                ? "Публично съдържание, доверие и запитвания."
                : "Public-facing content, credibility, and lead capture."
              : pageLanguage === "bg"
                ? "Клиентски или оперативен вход в системата."
                : "User-facing or operational entry point into the platform.",
          tags: environmentLabels,
          kind: "channel",
        })
      );
    });

    ingressValues.forEach((entry) => {
      const edgeMap = {
        cdn: {
          title: "CDN",
          meta: pageLanguage === "bg" ? "Публичен edge слой" : "Public edge delivery",
          note:
            pageLanguage === "bg"
              ? "Кеширане, по-бърз достъп и географска близост."
              : "Caching, faster access, and geographic proximity.",
          kind: "edge",
        },
        waf: {
          title: "WAF",
          meta: pageLanguage === "bg" ? "Защита на входа" : "Ingress protection",
          note:
            pageLanguage === "bg"
              ? "Контролира публичния трафик и web рисковете."
              : "Protects public traffic and common web threats.",
          kind: "security",
        },
        "load-balancer": {
          title: pageLanguage === "bg" ? "Load balancer" : "Load balancer",
          meta: pageLanguage === "bg" ? "Маршрутизира към услугите" : "Routes traffic into services",
          note:
            pageLanguage === "bg"
              ? "Поддържа health checks и разпределение на трафика."
              : "Handles health checks and traffic distribution.",
          kind: "edge",
        },
        "api-gateway": {
          title: "API gateway",
          meta: pageLanguage === "bg" ? "API вход и политики" : "API ingress and policy layer",
          note:
            pageLanguage === "bg"
              ? "Versioning, auth и routing за API потоци."
              : "Versioning, auth, and routing for API flows.",
          kind: "edge",
        },
        vpn: {
          title: "VPN access",
          meta: pageLanguage === "bg" ? "Частен достъп" : "Private access",
          note:
            pageLanguage === "bg"
              ? "Сигурен достъп за екипи, офиси или вътрешни системи."
              : "Secure access for teams, offices, or internal systems.",
          kind: "security",
        },
        "direct-connect": {
          title: pageLanguage === "bg" ? "Private link" : "Private link",
          meta: pageLanguage === "bg" ? "Hybrid connectivity" : "Hybrid connectivity",
          note:
            pageLanguage === "bg"
              ? "Ниска латентност между cloud и on-prem."
              : "Low-latency connectivity between cloud and on-prem.",
          kind: "network",
        },
        bastion: {
          title: pageLanguage === "bg" ? "Bastion host" : "Bastion host",
          meta: pageLanguage === "bg" ? "Административен достъп" : "Administrative access",
          note:
            pageLanguage === "bg"
              ? "Контролиран достъп до чувствителни слоеве."
              : "Controlled operational entry into sensitive layers.",
          kind: "security",
        },
      };

      const config = edgeMap[entry];
      if (config) {
        nodes.push(createNode({ lane: "edge", tags: [cloudLabel].filter(Boolean), ...config }));
      }
    });

    if (usesCloud) {
      nodes.push(
        createNode({
          lane: "network",
          title: `${cloudLabel || "Cloud"} ${pageLanguage === "bg" ? "основа" : "foundation"}`,
          meta: [labelFor("network_topology", answers.networkTopology), `${answers.azCount} AZ`].filter(Boolean).join(" • "),
          note: [labelFor("subnet_pattern", answers.subnetPattern), answers.regions, answers.vpcNotes].filter(Boolean).join(" • ") || strings.pending,
          tags: environmentLabels,
          kind: "network",
        })
      );
    }

    if (usesOnPrem) {
      nodes.push(
        createNode({
          lane: "network",
          title: pageLanguage === "bg" ? "On-prem среда" : "On-prem estate",
          meta: pageLanguage === "bg" ? "Мрежа, VM-и и legacy зависимости" : "Network, VMs, and legacy dependencies",
          note:
            answers.vpcNotes ||
            (pageLanguage === "bg"
              ? "Включва on-prem сегменти, вътрешни системи и частни зависимости."
              : "Includes on-prem segments, internal systems, and private dependencies."),
          tags: ["On-prem"],
          kind: "network",
        })
      );
    }

    if (answers.deploymentModel === "hybrid") {
      nodes.push(
        createNode({
          lane: "network",
          title: pageLanguage === "bg" ? "Hybrid connectivity" : "Hybrid connectivity",
          meta: ingressValues.includes("direct-connect")
            ? pageLanguage === "bg"
              ? "Dedicated private link"
              : "Dedicated private link"
            : pageLanguage === "bg"
              ? "VPN или site-to-site"
              : "VPN or site-to-site",
          note:
            answers.constraints ||
            (pageLanguage === "bg"
              ? "Синхронизация на трафик, идентичност и data потоци."
              : "Synchronizes traffic, identity, and data flows between estates."),
          tags: ["Hybrid"],
          kind: "network",
        })
      );
    }

    if (answers.hosting.includes("vm")) {
      addNumberedNodes(nodes, {
        lane: "services",
        baseTitle: `${prefix}${usesCloud ? "app-ec2" : "app-vm"}`,
        meta: pageLanguage === "bg" ? "Приложен слой" : "Application tier",
        note: answers.computeNotes || strings.pending,
        tags: [labelFor("autoscaling", answers.autoscaling)].filter(Boolean),
        kind: "compute",
        count: Math.max(answers.appNodeCount, 1),
        visibleLimit: 4,
      });

      if (answers.workerNodeCount > 0) {
        addNumberedNodes(nodes, {
          lane: "services",
          baseTitle: `${prefix}worker`,
          meta: pageLanguage === "bg" ? "Фонови задачи" : "Background jobs",
          note: answers.computeNotes || strings.pending,
          tags: ["Jobs"],
          kind: "compute",
          count: answers.workerNodeCount,
          visibleLimit: 3,
        });
      }

      if (answers.utilityNodeCount > 0) {
        addNumberedNodes(nodes, {
          lane: "services",
          baseTitle: `${prefix}utility`,
          meta: pageLanguage === "bg" ? "Админ или scheduler слой" : "Admin or scheduler tier",
          note: answers.computeNotes || strings.pending,
          tags: ["Ops"],
          kind: "compute",
          count: answers.utilityNodeCount,
          visibleLimit: 2,
        });
      }
    }

    if (answers.hosting.includes("containers")) {
      nodes.push(
        createNode({
          lane: "services",
          title: `${prefix}${pageLanguage === "bg" ? "container-services" : "container-services"}`,
          meta: pageLanguage === "bg" ? "Container runtime" : "Container runtime",
          note:
            pageLanguage === "bg"
              ? "Контейнеризирани услуги и release потоци."
              : "Containerized services and rollout flows.",
          tags: [cloudLabel].filter(Boolean),
          kind: "compute",
        })
      );
    }

    if (answers.hosting.includes("kubernetes")) {
      nodes.push(
        createNode({
          lane: "services",
          title: `${prefix}${pageLanguage === "bg" ? "kubernetes-cluster" : "kubernetes-cluster"}`,
          meta: pageLanguage === "bg" ? "Kubernetes orchestration" : "Kubernetes orchestration",
          note:
            pageLanguage === "bg"
              ? "Контролира scaling, services и container workloads."
              : "Controls scaling, services, and container workloads.",
          tags: [cloudLabel, ...environmentLabels].filter(Boolean),
          kind: "compute",
        })
      );
    }

    if (answers.hosting.includes("serverless")) {
      nodes.push(
        createNode({
          lane: "services",
          title: `${prefix}${pageLanguage === "bg" ? "serverless-functions" : "serverless-functions"}`,
          meta: pageLanguage === "bg" ? "Събитийни функции" : "Event-driven functions",
          note:
            pageLanguage === "bg"
              ? "Подходящо за burst трафик и async процеси."
              : "Useful for bursty traffic and async processing.",
          tags: ["Serverless"],
          kind: "compute",
        })
      );
    }

    if (answers.hosting.includes("managed-runtime")) {
      nodes.push(
        createNode({
          lane: "services",
          title: `${prefix}${pageLanguage === "bg" ? "managed-runtime" : "managed-runtime"}`,
          meta: pageLanguage === "bg" ? "Managed application platform" : "Managed application platform",
          note:
            pageLanguage === "bg"
              ? "Поддържа release-и с по-малка инфраструктурна тежест."
              : "Supports releases with less infrastructure overhead.",
          tags: [cloudLabel].filter(Boolean),
          kind: "compute",
        })
      );
    }

    if (!answers.hosting.length) {
      nodes.push(
        createNode({
          lane: "services",
          title: `${prefix}${pageLanguage === "bg" ? "application-service" : "application-service"}`,
          meta: pageLanguage === "bg" ? "Основен приложен слой" : "Primary application service",
          note: answers.computeNotes || strings.pending,
          tags: environmentLabels,
          kind: "compute",
        })
      );
    }

    if (answers.relationalDb !== "none") {
      nodes.push(
        createNode({
          lane: "data",
          title: `${prefix}${answers.relationalDb}-primary`,
          meta: pageLanguage === "bg" ? "Основна транзакционна база" : "Primary transactional database",
          note:
            pageLanguage === "bg"
              ? "Основната база данни за платформата."
              : "Primary transactional database for the platform.",
          tags: environmentLabels.slice(0, 2),
          kind: "data",
        })
      );

      if (answers.relationalDbCount > 1) {
        addNumberedNodes(nodes, {
          lane: "data",
          baseTitle: `${prefix}${answers.relationalDb}-replica`,
          meta: pageLanguage === "bg" ? "Replica или HA слой" : "Replica or HA layer",
          note:
            pageLanguage === "bg"
              ? "Използва се за read scaling, failover или reporting."
              : "Used for read scaling, failover, or reporting.",
          tags: ["HA"],
          kind: "data",
          count: answers.relationalDbCount - 1,
          visibleLimit: 2,
        });
      }
    }

    if (answers.cacheLayer !== "none") {
      nodes.push(
        createNode({
          lane: "data",
          title: `${prefix}${answers.cacheLayer}-cache`,
          meta: pageLanguage === "bg" ? "Performance cache" : "Performance cache",
          note:
            pageLanguage === "bg"
              ? "Намалява latency и натиск върху базата."
              : "Reduces latency and pressure on the database.",
          tags: ["Cache"],
          kind: "data",
        })
      );
    }

    if (answers.objectStorage === "yes") {
      nodes.push(
        createNode({
          lane: "data",
          title: `${prefix}${pageLanguage === "bg" ? "object-storage" : "object-storage"}`,
          meta: pageLanguage === "bg" ? "Файлове, assets и exports" : "Files, assets, and exports",
          note:
            pageLanguage === "bg"
              ? "Покрива uploads, media, exports и архиви."
              : "Supports uploads, media, exports, and archives.",
          tags: ["Storage"],
          kind: "data",
        })
      );
    }

    answers.messaging.forEach((entry) => {
      nodes.push(
        createNode({
          lane: "data",
          title: `${prefix}${entry}`,
          meta: labelFor("messaging", entry),
          note:
            pageLanguage === "bg"
              ? "Координира async потоци и системни събития."
              : "Coordinates async flows and system events.",
          tags: ["Async"],
          kind: "data",
        })
      );
    });

    answers.dataServices.forEach((entry) => {
      nodes.push(
        createNode({
          lane: "data",
          title: `${prefix}${entry}`,
          meta: labelFor("data_services", entry),
          note:
            pageLanguage === "bg"
              ? "Служи за search, analytics или BI изходи."
              : "Supports search, analytics, or BI outputs.",
          tags: ["Analytics"],
          kind: "integration",
        })
      );
    });

    answers.integrationList.slice(0, 5).forEach((integration) => {
      nodes.push(
        createNode({
          lane: "data",
          title: integration,
          meta: pageLanguage === "bg" ? "Външна система" : "External system",
          note:
            pageLanguage === "bg"
              ? "Интеграция, която влияе на основния бизнес поток."
              : "External integration that affects the main business flow.",
          tags: ["External"],
          kind: "integration",
        })
      );
    });

    if (answers.aiFocus.includes("rag")) {
      nodes.push(
        createNode({
          lane: "data",
          title: `${prefix}${pageLanguage === "bg" ? "vector-store" : "vector-store"}`,
          meta: pageLanguage === "bg" ? "Retrieval слой за AI" : "Retrieval layer for AI",
          note:
            pageLanguage === "bg"
              ? "Knowledge слой за AI search или assistant flow."
              : "Knowledge layer for AI search or assistant flows.",
          tags: ["AI"],
          kind: "data",
        })
      );
    }

    if (answers.identity.includes("sso")) {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${pageLanguage === "bg" ? "sso" : "sso"}`,
          meta: pageLanguage === "bg" ? "Identity provider" : "Identity provider",
          note:
            pageLanguage === "bg"
              ? "SSO вход за екипи, партньори и вътрешни роли."
              : "SSO entry point for teams, partners, and internal roles.",
          tags: ["Identity"],
          kind: "security",
        })
      );
    }

    if (answers.identity.includes("iam") || answers.identity.includes("rbac")) {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${pageLanguage === "bg" ? "iam-rbac" : "iam-rbac"}`,
          meta: pageLanguage === "bg" ? "Контрол на роли и достъп" : "Role and access control",
          note:
            pageLanguage === "bg"
              ? "Политики за роли, права и operational boundaries."
              : "Policies for roles, permissions, and operational boundaries.",
          tags: ["Security"],
          kind: "security",
        })
      );
    }

    if (answers.identity.includes("secrets")) {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${pageLanguage === "bg" ? "secrets" : "secrets"}`,
          meta: pageLanguage === "bg" ? "Секрети, ключове и certs" : "Secrets, keys, and certificates",
          note:
            pageLanguage === "bg"
              ? "Покрива credentials, rotations и secure configuration."
              : "Covers credentials, rotations, and secure configuration.",
          tags: ["Security"],
          kind: "security",
        })
      );
    }

    answers.ops.forEach((entry) => {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${entry}`,
          meta: labelFor("ops", entry),
          note:
            entry === "monitoring"
              ? pageLanguage === "bg"
                ? "Следи availability, latency и business-critical сигнали."
                : "Tracks availability, latency, and business-critical signals."
              : pageLanguage === "bg"
                ? "Поддържа operational visibility и delivery дисциплина."
                : "Supports operational visibility and delivery discipline.",
          tags: [entry === "backup" ? "Recovery" : "Ops"],
          kind: entry === "siem" ? "security" : "ops",
        })
      );
    });

    if (answers.recoveryTier && answers.recoveryTier !== "basic") {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${pageLanguage === "bg" ? "disaster-recovery" : "disaster-recovery"}`,
          meta: labelFor("recovery_tier", answers.recoveryTier),
          note:
            pageLanguage === "bg"
              ? "Подготвя failover и recovery сценарии."
              : "Prepares failover and recovery scenarios.",
          tags: ["DR"],
          kind: "ops",
        })
      );
    }

    if (answers.compliance) {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${pageLanguage === "bg" ? "compliance-controls" : "compliance-controls"}`,
          meta: answers.compliance,
          note:
            pageLanguage === "bg"
              ? "Регулации, audit изисквания или вътрешни политики."
              : "Regulatory, audit, or internal policy requirements.",
          tags: ["Compliance"],
          kind: "security",
        })
      );
    }

    if (answers.aiFocus.includes("assistant")) {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${pageLanguage === "bg" ? "ai-assistant-flow" : "ai-assistant-flow"}`,
          meta: pageLanguage === "bg" ? "AI experience layer" : "AI experience layer",
          note:
            pageLanguage === "bg"
              ? "AI слой за чат, support или knowledge помощ."
              : "AI layer for chat, support, or knowledge assistance.",
          tags: ["AI"],
          kind: "enablement",
        })
      );
    }

    if (answers.aiFocus.includes("governance")) {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${pageLanguage === "bg" ? "ai-governance" : "ai-governance"}`,
          meta: pageLanguage === "bg" ? "Policy и guardrails" : "Policy and guardrails",
          note:
            pageLanguage === "bg"
              ? "Контролира usage boundaries, prompting и data access."
              : "Controls usage boundaries, prompting, and data access.",
          tags: ["AI"],
          kind: "enablement",
        })
      );
    }

    if (answers.aiFocus.includes("training")) {
      nodes.push(
        createNode({
          lane: "operations",
          title: `${prefix}${pageLanguage === "bg" ? "ai-training" : "ai-training"}`,
          meta: answers.trainingAudience || (pageLanguage === "bg" ? "Екипно обучение" : "Team training"),
          note:
            pageLanguage === "bg"
              ? "Практически AI training за sales, operations, leadership и technical teams."
              : "Practical AI training for sales, operations, leadership, and technical teams.",
          tags: ["Training"],
          kind: "enablement",
        })
      );
    }

    laneOrder.forEach((laneId) => {
      buildLaneGroups(laneId, nodes.filter((node) => node.lane === laneId)).forEach((group) => {
        addSequentialConnections(group.nodes);
      });
    });

    const channels = nodes.filter((node) => node.lane === "channels");
    const edge = nodes.filter((node) => node.lane === "edge");
    const network = nodes.filter((node) => node.lane === "network");
    const services = nodes.filter((node) => node.lane === "services");
    const data = nodes.filter((node) => node.lane === "data");
    const operations = nodes.filter((node) => node.lane === "operations");

    const publicIngress = edge.find((node) => classifyNodeGroup(node) === "publicIngress");
    const protectedAccess = edge.find((node) => classifyNodeGroup(node) === "protectedAccess");
    const networkCore = network.find((node) => classifyNodeGroup(node) === "networkCore") || network[0];
    const hybridLink = network.find((node) => classifyNodeGroup(node) === "hybridAccess");
    const appTier = services.find((node) => classifyNodeGroup(node) === "appTier") || services[0];
    const platformRuntime = services.find((node) => classifyNodeGroup(node) === "platformRuntime");
    const asyncWorkloads = services.filter((node) => classifyNodeGroup(node) === "asyncWorkloads");
    const transactionalData = data.filter((node) => classifyNodeGroup(node) === "transactionalData");
    const asyncData = data.filter((node) => classifyNodeGroup(node) === "asyncData");
    const analyticsAi = data.filter((node) => classifyNodeGroup(node) === "analyticsAi");
    const externalSystems = data.filter((node) => classifyNodeGroup(node) === "externalSystems");
    const securityIdentity = operations.filter((node) => classifyNodeGroup(node) === "securityIdentity");
    const observability = operations.filter((node) => classifyNodeGroup(node) === "observability");
    const deliveryRecovery = operations.filter((node) => classifyNodeGroup(node) === "deliveryRecovery");
    const aiEnablement = operations.filter((node) => classifyNodeGroup(node) === "aiEnablement");

    channels.forEach((node) => {
      const groupId = classifyNodeGroup(node);
      if (groupId === "programmaticChannels") {
        connectNodes(node, [edge.find((item) => /api gateway/i.test(item.title)) || publicIngress || networkCore || appTier]);
        return;
      }

      if (groupId === "internalChannels") {
        connectNodes(node, [protectedAccess || publicIngress || networkCore || appTier]);
        return;
      }

      connectNodes(node, [publicIngress || protectedAccess || networkCore || appTier]);
    });

    connectChains(edge, network.length ? network : services, 2);
    connectNodes(networkCore || hybridLink || edge[0], [platformRuntime || appTier].filter(Boolean));
    connectNodes(platformRuntime || appTier, [appTier].filter(Boolean));
    connectChains(services.filter((node) => classifyNodeGroup(node) === "appTier"), transactionalData, 2);
    connectChains(services.filter((node) => classifyNodeGroup(node) === "appTier"), asyncData, 2);
    connectChains(asyncWorkloads, asyncData, 2);
    connectChains(asyncWorkloads.length ? asyncWorkloads : services.slice(0, 2), externalSystems, 2);
    connectChains(transactionalData, analyticsAi, 2);
    connectChains(services.slice(0, 2), observability, 2);
    connectChains([publicIngress, protectedAccess, networkCore].filter(Boolean), securityIdentity, 2);
    connectChains([appTier, platformRuntime, ...transactionalData.slice(0, 1)].filter(Boolean), deliveryRecovery, 2);
    connectChains([appTier, ...analyticsAi.slice(0, 1)].filter(Boolean), aiEnablement, 2);

    const summaryCards = [
      {
        label: strings.summary.deployment,
        value: [
          labelFor("deployment_model", answers.deploymentModel),
          answers.deploymentModel !== "on-prem" ? labelFor("primary_cloud", answers.primaryCloud) : "",
        ]
          .filter(Boolean)
          .join(" • ") || strings.pending,
        note: answers.systemName || strings.systemFallback,
      },
      {
        label: strings.summary.network,
        value:
          [labelFor("network_topology", answers.networkTopology), `${answers.azCount} AZ`]
            .filter(Boolean)
            .join(" • ") || strings.pending,
        note: [labelFor("subnet_pattern", answers.subnetPattern), answers.regions].filter(Boolean).join(" • ") || strings.pending,
      },
      {
        label: strings.summary.compute,
        value: services.length ? `${services.length} ${pageLanguage === "bg" ? "компонента" : "components"}` : strings.pending,
        note: joinLabels(labelsFor("hosting", answers.hosting)) || strings.pending,
      },
      {
        label: strings.summary.data,
        value: data.length ? `${data.length} ${pageLanguage === "bg" ? "слоя" : "layers"}` : strings.pending,
        note:
          [
            answers.relationalDb !== "none" ? labelFor("relational_db", answers.relationalDb) : "",
            answers.cacheLayer !== "none" ? labelFor("cache_layer", answers.cacheLayer) : "",
          ]
            .filter(Boolean)
            .join(" • ") || strings.pending,
      },
      {
        label: strings.summary.operations,
        value: operations.length ? `${operations.length} ${pageLanguage === "bg" ? "контроли" : "controls"}` : strings.pending,
        note: joinLabels(labelsFor("ops", answers.ops)) || strings.none,
      },
      {
        label: strings.summary.ai,
        value: joinLabels(labelsFor("ai_focus", answers.aiFocus)) || strings.none,
        note: answers.trainingAudience || (pageLanguage === "bg" ? "По заявка" : "Available on request"),
      },
    ];

    const brief = [
      strings.brief.title,
      `${strings.brief.system}: ${answers.systemName || strings.systemFallback}`,
      `${strings.brief.goal}: ${labelFor("business_goal", answers.businessGoal) || strings.pending}`,
      `${strings.brief.deployment}: ${summaryCards[0].value}`,
      `${strings.brief.channels}: ${joinLabels(labelsFor("channels", channelValues))}`,
      `${strings.brief.network}: ${summaryCards[1].value}${answers.vpcNotes ? ` • ${answers.vpcNotes}` : ""}`,
      `${strings.brief.compute}: ${summaryCards[2].value}${answers.computeNotes ? ` • ${answers.computeNotes}` : ""}`,
      `${strings.brief.data}: ${summaryCards[3].value}${answers.integrationList.length ? ` • ${answers.integrationList.join(", ")}` : ""}`,
      `${strings.brief.operations}: ${summaryCards[4].value}`,
      `${strings.brief.ai}: ${summaryCards[5].value}`,
      `${strings.brief.context}: ${answers.businessContext || strings.pending}`,
      `${strings.brief.constraints}: ${answers.constraints || strings.pending}`,
    ].join("\n");

    const model = {
      answers,
      nodes,
      summaryCards,
      brief,
      lanes: [],
    };

    syncLanes(model);
    return model;
  };

  const buildTerraformConfig = (model) => {
    if (!model?.nodes?.length) {
      return strings.terraform.placeholder;
    }

    const { answers } = model;
    const environments = answers.environments.length ? answers.environments : ["prod"];
    const projectSlug = slugify(answers.systemName || strings.systemFallback, "mycompany_stack");
    const systemName = answers.systemName || strings.systemFallback;
    const region = firstRegion(answers);
    const usesCloud = ["cloud", "hybrid", "saas-heavy"].includes(answers.deploymentModel);
    const usesOnPrem = ["on-prem", "hybrid"].includes(answers.deploymentModel);
    const cloudProvider = usesCloud ? answers.primaryCloud || "aws" : "none";

    const inventoryComments = [
      "",
      "# Generated component inventory",
      ...model.lanes.flatMap((lane) => [
        `# ${lane.label}`,
        ...lane.nodes.map((node) => {
          const parts = [node.title, node.meta, node.note].filter(Boolean);
          return `# - ${parts.join(" | ")}`;
        }),
      ]),
    ];

    const commonHeader = [
      "# Example Terraform starter generated by MyCompany",
      "# Replace placeholder CIDRs, image IDs, module sources, and secrets before apply.",
      "",
    ];

    const commonLocals = [
      "locals {",
      `  project_name      = ${hclString(projectSlug)}`,
      `  system_name       = ${hclString(systemName)}`,
      `  deployment_model  = ${hclString(answers.deploymentModel || "cloud")}`,
      `  environment_names = ${quoteList(environments)}`,
      `  az_count          = ${answers.azCount}`,
      `  tags = {`,
      `    Project   = ${hclString(systemName)}`,
      `    ManagedBy = "terraform"`,
      `    Service   = "mycompany-architecture-builder"`,
      "  }",
      "}",
      "",
    ];

    const dataServices = answers.dataServices;
    const messaging = answers.messaging;

    if (cloudProvider === "aws") {
      return [
        ...commonHeader,
        "terraform {",
        '  required_version = ">= 1.6.0"',
        "  required_providers {",
        "    aws = {",
        '      source  = "hashicorp/aws"',
        '      version = "~> 5.0"',
        "    }",
        "  }",
        "}",
        "",
        'provider "aws" {',
        "  region = var.aws_region",
        "}",
        "",
        'variable "aws_region" {',
        '  description = "Primary AWS region"',
        `  default     = ${hclString(region)}`,
        "}",
        "",
        ...commonLocals,
        "# Network foundation",
        'module "network" {',
        '  source         = "./modules/aws-network"',
        "  project_name   = local.project_name",
        '  vpc_cidr       = "10.10.0.0/16" # TODO: replace with approved CIDR',
        `  topology       = ${hclString(answers.networkTopology || "single-vpc")}`,
        `  subnet_pattern = ${hclString(answers.subnetPattern || "public-private")}`,
        "  az_count       = local.az_count",
        "  environment_names = local.environment_names",
        "  tags           = local.tags",
        "}",
        "",
        ...(answers.ingress.length
          ? [
              "# Edge, ingress, and access",
              'module "edge" {',
              '  source            = "./modules/aws-edge"',
              "  project_name      = local.project_name",
              "  vpc_id            = module.network.vpc_id",
              "  public_subnet_ids = module.network.public_subnet_ids",
              `  enable_cdn        = ${answers.ingress.includes("cdn")}`,
              `  enable_waf        = ${answers.ingress.includes("waf")}`,
              `  enable_alb        = ${answers.ingress.includes("load-balancer")}`,
              `  enable_api_gw     = ${answers.ingress.includes("api-gateway")}`,
              `  enable_vpn        = ${answers.ingress.includes("vpn")}`,
              `  enable_bastion    = ${answers.ingress.includes("bastion")}`,
              "  tags              = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("vm")
          ? [
              "# EC2 application tiers",
              'module "app_compute" {',
              '  source            = "./modules/aws-ec2-app"',
              "  project_name      = local.project_name",
              "  private_subnet_ids = module.network.app_subnet_ids",
              `  app_instance_count = ${Math.max(answers.appNodeCount, 1)}`,
              `  worker_count       = ${answers.workerNodeCount}`,
              `  utility_count      = ${answers.utilityNodeCount}`,
              `  autoscaling_mode   = ${hclString(answers.autoscaling || "auto")}`,
              `  compute_note       = ${hclString(answers.computeNotes || "Refine roles per node before implementation")}`,
              "  tags               = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("containers")
          ? [
              'module "ecs_services" {',
              '  source             = "./modules/aws-ecs-services"',
              "  project_name       = local.project_name",
              "  private_subnet_ids = module.network.app_subnet_ids",
              "  tags               = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("kubernetes")
          ? [
              'module "eks" {',
              '  source             = "./modules/aws-eks"',
              "  project_name       = local.project_name",
              "  private_subnet_ids = module.network.app_subnet_ids",
              "  tags               = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("serverless")
          ? [
              'module "lambda_services" {',
              '  source       = "./modules/aws-lambda-services"',
              "  project_name = local.project_name",
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("managed-runtime")
          ? [
              'module "managed_runtime" {',
              '  source       = "./modules/aws-managed-runtime"',
              "  project_name = local.project_name",
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.relationalDb !== "none"
          ? [
              "# Transactional data tier",
              'module "database" {',
              '  source             = "./modules/aws-rds"',
              "  project_name       = local.project_name",
              `  engine             = ${hclString(answers.relationalDb)}`,
              `  instance_count     = ${Math.max(answers.relationalDbCount, 1)}`,
              "  data_subnet_ids    = module.network.data_subnet_ids",
              "  tags               = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.cacheLayer !== "none"
          ? [
              'module "cache" {',
              '  source          = "./modules/aws-elasticache"',
              "  project_name    = local.project_name",
              `  engine          = ${hclString(answers.cacheLayer)}`,
              "  data_subnet_ids = module.network.data_subnet_ids",
              "  tags            = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.objectStorage === "yes"
          ? [
              'module "object_storage" {',
              '  source       = "./modules/aws-s3"',
              "  project_name = local.project_name",
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        ...messaging.flatMap((entry) => [
          `module "${slugify(entry)}" {`,
          `  source       = "./modules/aws-${slugify(entry)}"`,
          "  project_name = local.project_name",
          "  tags         = local.tags",
          "}",
          "",
        ]),
        ...dataServices.flatMap((entry) => [
          `module "${slugify(entry)}" {`,
          `  source       = "./modules/aws-${slugify(entry)}"`,
          "  project_name = local.project_name",
          "  tags         = local.tags",
          "}",
          "",
        ]),
        ...(answers.aiFocus.includes("rag")
          ? [
              'module "vector_store" {',
              '  source       = "./modules/aws-vector-store"',
              "  project_name = local.project_name",
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        "# Operations, resilience, and controls",
        'module "operations" {',
        '  source            = "./modules/aws-operations"',
        "  project_name      = local.project_name",
        `  enable_monitoring = ${answers.ops.includes("monitoring")}`,
        `  enable_logging    = ${answers.ops.includes("logging")}`,
        `  enable_tracing    = ${answers.ops.includes("tracing")}`,
        `  enable_siem       = ${answers.ops.includes("siem")}`,
        `  enable_backup     = ${answers.ops.includes("backup")}`,
        `  enable_cicd       = ${answers.ops.includes("cicd")}`,
        `  recovery_tier     = ${hclString(answers.recoveryTier || "standard")}`,
        `  compliance_note   = ${hclString(answers.compliance || "Define policy set with stakeholders")}`,
        "  tags              = local.tags",
        "}",
        "",
        ...(usesOnPrem
          ? [
              'module "onprem_connectivity" {',
              '  source          = "./modules/hybrid-link"',
              "  project_name    = local.project_name",
              `  connectivity_note = ${hclString(answers.vpcNotes || "Define VPN / Direct Connect / MPLS details")}`,
              "}",
              "",
            ]
          : []),
        'output "architecture_summary" {',
        "  value = {",
        "    system_name  = local.system_name",
        "    provider     = \"aws\"",
        "    environments = local.environment_names",
        `    channels     = ${quoteList(labelsFor("channels", answers.channels.length ? answers.channels : ["public-site"]))}`,
        "  }",
        "}",
        ...inventoryComments,
      ].join("\n");
    }

    if (cloudProvider === "azure") {
      return [
        ...commonHeader,
        "terraform {",
        '  required_version = ">= 1.6.0"',
        "  required_providers {",
        "    azurerm = {",
        '      source  = "hashicorp/azurerm"',
        '      version = "~> 4.0"',
        "    }",
        "  }",
        "}",
        "",
        'provider "azurerm" {',
        "  features {}",
        "}",
        "",
        ...commonLocals,
        'module "network" {',
        '  source            = "./modules/azure-network"',
        "  project_name      = local.project_name",
        `  topology          = ${hclString(answers.networkTopology || "single-vpc")}`,
        `  subnet_pattern    = ${hclString(answers.subnetPattern || "public-private")}`,
        `  primary_region    = ${hclString(region)}`,
        "  environment_names = local.environment_names",
        "  tags              = local.tags",
        "}",
        "",
        ...(answers.hosting.includes("vm")
          ? [
              'module "vm_scale_sets" {',
              '  source          = "./modules/azure-vmss"',
              "  project_name    = local.project_name",
              `  app_count       = ${Math.max(answers.appNodeCount, 1)}`,
              `  worker_count    = ${answers.workerNodeCount}`,
              `  utility_count   = ${answers.utilityNodeCount}`,
              `  scaling_mode    = ${hclString(answers.autoscaling || "auto")}`,
              "  subnet_ids      = module.network.app_subnet_ids",
              "  tags            = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("containers")
          ? [
              'module "container_apps" {',
              '  source          = "./modules/azure-container-apps"',
              "  project_name    = local.project_name",
              "  subnet_ids      = module.network.app_subnet_ids",
              "  tags            = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("kubernetes")
          ? [
              'module "aks" {',
              '  source          = "./modules/azure-aks"',
              "  project_name    = local.project_name",
              "  subnet_ids      = module.network.app_subnet_ids",
              "  tags            = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("serverless")
          ? [
              'module "functions" {',
              '  source       = "./modules/azure-functions"',
              "  project_name = local.project_name",
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.relationalDb !== "none"
          ? [
              'module "database" {',
              '  source       = "./modules/azure-database"',
              "  project_name = local.project_name",
              `  engine       = ${hclString(answers.relationalDb)}`,
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.cacheLayer !== "none"
          ? [
              'module "cache" {',
              '  source       = "./modules/azure-redis"',
              "  project_name = local.project_name",
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        'module "operations" {',
        '  source            = "./modules/azure-operations"',
        "  project_name      = local.project_name",
        `  enable_monitoring = ${answers.ops.includes("monitoring")}`,
        `  enable_logging    = ${answers.ops.includes("logging")}`,
        `  enable_backup     = ${answers.ops.includes("backup")}`,
        `  enable_cicd       = ${answers.ops.includes("cicd")}`,
        "  tags              = local.tags",
        "}",
        ...inventoryComments,
      ].join("\n");
    }

    if (cloudProvider === "gcp") {
      return [
        ...commonHeader,
        "terraform {",
        '  required_version = ">= 1.6.0"',
        "  required_providers {",
        "    google = {",
        '      source  = "hashicorp/google"',
        '      version = "~> 6.0"',
        "    }",
        "  }",
        "}",
        "",
        'provider "google" {',
        "  project = var.project_id",
        "  region  = var.region",
        "}",
        "",
        'variable "project_id" {',
        '  description = "GCP project id"',
        '  default     = "replace-me"',
        "}",
        "",
        'variable "region" {',
        `  default = ${hclString(region)}`,
        "}",
        "",
        ...commonLocals,
        'module "network" {',
        '  source            = "./modules/gcp-network"',
        "  project_name      = local.project_name",
        `  subnet_pattern    = ${hclString(answers.subnetPattern || "public-private")}`,
        "  environment_names = local.environment_names",
        "  tags              = local.tags",
        "}",
        "",
        ...(answers.hosting.includes("vm")
          ? [
              'module "mig" {',
              '  source          = "./modules/gcp-mig"',
              "  project_name    = local.project_name",
              `  app_count       = ${Math.max(answers.appNodeCount, 1)}`,
              `  worker_count    = ${answers.workerNodeCount}`,
              "  subnet_ids      = module.network.app_subnet_ids",
              "  tags            = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("kubernetes")
          ? [
              'module "gke" {',
              '  source          = "./modules/gcp-gke"',
              "  project_name    = local.project_name",
              "  subnet_ids      = module.network.app_subnet_ids",
              "  tags            = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.hosting.includes("serverless")
          ? [
              'module "cloud_run" {',
              '  source       = "./modules/gcp-cloud-run"',
              "  project_name = local.project_name",
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        ...(answers.relationalDb !== "none"
          ? [
              'module "sql" {',
              '  source       = "./modules/gcp-cloud-sql"',
              "  project_name = local.project_name",
              `  engine       = ${hclString(answers.relationalDb)}`,
              "  tags         = local.tags",
              "}",
              "",
            ]
          : []),
        'module "operations" {',
        '  source            = "./modules/gcp-operations"',
        "  project_name      = local.project_name",
        `  enable_monitoring = ${answers.ops.includes("monitoring")}`,
        `  enable_logging    = ${answers.ops.includes("logging")}`,
        `  enable_backup     = ${answers.ops.includes("backup")}`,
        `  enable_cicd       = ${answers.ops.includes("cicd")}`,
        "  tags              = local.tags",
        "}",
        ...inventoryComments,
      ].join("\n");
    }

    return [
      ...commonHeader,
      "terraform {",
      '  required_version = ">= 1.6.0"',
      "}",
      "",
      ...commonLocals,
      "# Provider choice is still open for this estate.",
      "# Replace the module sources below with the virtualization or private-cloud provider you use.",
      "",
      'module "network_segments" {',
      '  source            = "./modules/private-network"',
      "  project_name      = local.project_name",
      `  topology          = ${hclString(answers.networkTopology || "private-core")}`,
      `  subnet_pattern    = ${hclString(answers.subnetPattern || "custom")}`,
      "  environment_names = local.environment_names",
      "}",
      "",
      'module "vm_estate" {',
      '  source         = "./modules/private-vm-estate"',
      "  project_name   = local.project_name",
      `  app_count      = ${Math.max(answers.appNodeCount, 1)}`,
      `  worker_count   = ${answers.workerNodeCount}`,
      `  utility_count  = ${answers.utilityNodeCount}`,
      `  scaling_mode   = ${hclString(answers.autoscaling || "manual")}`,
      "}",
      "",
      ...(answers.relationalDb !== "none"
        ? [
            'module "database_cluster" {',
            '  source       = "./modules/private-database"',
            "  project_name = local.project_name",
            `  engine       = ${hclString(answers.relationalDb)}`,
            "}",
            "",
          ]
        : []),
      'module "operations" {',
      '  source            = "./modules/private-operations"',
      "  project_name      = local.project_name",
      `  enable_monitoring = ${answers.ops.includes("monitoring")}`,
      `  enable_logging    = ${answers.ops.includes("logging")}`,
      `  enable_backup     = ${answers.ops.includes("backup")}`,
      `  recovery_tier     = ${hclString(answers.recoveryTier || "standard")}`,
      "}",
      "",
      ...(usesCloud && answers.deploymentModel === "hybrid"
        ? [
            "# This estate is hybrid. Add a provider-specific connectivity module for cloud edge services.",
            "",
          ]
        : []),
      ...inventoryComments,
    ].join("\n");
  };

  const renderSummaryGrid = (model) => {
    if (!summaryGrid) {
      return;
    }

    summaryGrid.innerHTML = model.summaryCards
      .map(
        (card) => `
          <article class="architecture-summary-card">
            <span>${escapeHtml(card.label)}</span>
            <strong>${escapeHtml(card.value)}</strong>
            <p>${escapeHtml(card.note)}</p>
          </article>
        `
      )
      .join("");
  };

  const highlightTerraformCode = (source) => {
    const placeholders = [];

    const protectTokens = (line) =>
      line.replace(/&quot;.*?&quot;/g, (match) => {
        const token = `__TF_PLACEHOLDER_${placeholders.length}__`;
        placeholders.push(`<span class="tf-string">${match}</span>`);
        return token;
      });

    const restoreTokens = (line) =>
      line.replace(/__TF_PLACEHOLDER_(\d+)__/g, (_, index) => placeholders[Number.parseInt(index, 10)] || "");

    const splitComment = (line) => {
      let inString = false;

      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const previous = line[index - 1];

        if (char === '"' && previous !== "\\") {
          inString = !inString;
        }

        if (char === "#" && !inString) {
          return {
            code: line.slice(0, index),
            comment: line.slice(index),
          };
        }
      }

      return { code: line, comment: "" };
    };

    const formatComment = (comment, inline = false) => {
      if (!comment) {
        return "";
      }

      const escaped = escapeHtml(comment);
      const lower = comment.toLowerCase();
      let className = "tf-comment";

      if (inline) {
        className += " tf-comment-inline";
      } else if (lower.includes("generated component inventory")) {
        className += " tf-comment-title";
      } else if (comment.startsWith("# - ")) {
        className += " tf-comment-inventory";
      } else if (lower.includes("todo") || lower.includes("replace")) {
        className += " tf-comment-todo";
      } else {
        className += " tf-comment-section";
      }

      return `<span class="${className}">${escaped}</span>`;
    };

    const formatCode = (code) => {
      if (!code.trim()) {
        return "";
      }

      let escaped = escapeHtml(code);
      escaped = protectTokens(escaped);
      escaped = escaped.replace(
        /^(\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*=)/,
        (_, indent, key, equals) =>
          `${indent}<span class="tf-key">${key}</span><span class="tf-operator">${equals}</span>`
      );
      escaped = escaped.replace(
        /\b(terraform|required_providers|provider|variable|locals|module|output|resource|data|features|value|default|description)\b/g,
        '<span class="tf-keyword">$1</span>'
      );
      escaped = escaped.replace(
        /\b(local|var|module)\.[A-Za-z0-9_.-]+/g,
        '<span class="tf-reference">$&</span>'
      );
      escaped = escaped.replace(/\b(true|false)\b/g, '<span class="tf-boolean">$1</span>');
      escaped = escaped.replace(/\b\d+(?:\.\d+)?\b/g, '<span class="tf-number">$&</span>');
      escaped = escaped.replace(/(\{|\}|\[|\]|\(|\))/g, '<span class="tf-punctuation">$1</span>');
      return restoreTokens(escaped);
    };

    return source
      .split("\n")
      .map((line) => {
        const { code, comment } = splitComment(line);
        const hasCode = Boolean(code.trim());
        const hasComment = Boolean(comment.trim());

        if (!hasCode && !hasComment) {
          return '<span class="tf-line tf-line-empty">&nbsp;</span>';
        }

        const codeHtml = formatCode(code);
        const commentHtml = formatComment(comment, hasCode);
        return `<span class="tf-line">${codeHtml}${codeHtml && commentHtml ? " " : ""}${commentHtml}</span>`;
      })
      .join("");
  };

  const renderInventory = (model) => {
    if (!inventoryTarget) {
      return;
    }

    if (!model.nodes.length) {
      inventoryTarget.innerHTML = `<p class="summary-note">${escapeHtml(strings.inspector.inventoryEmpty)}</p>`;
      return;
    }

    inventoryTarget.innerHTML = model.lanes
      .map((lane) =>
        lane.groups
          .filter((group) => group.nodes.length)
          .map(
            (group) => `
              <section class="inventory-group">
                <div class="inventory-group-head">
                  <div>
                    <em>${escapeHtml(lane.label)}</em>
                    <strong>${escapeHtml(group.label)}</strong>
                  </div>
                  <span class="inventory-group-count">${group.nodes.length}</span>
                </div>
                <div class="inventory-group-list">
                  ${group.nodes
                    .map(
                      (node) => `
                        <button
                          class="inventory-item${node.id === selectedNodeId ? " is-selected" : ""}"
                          type="button"
                          data-node-select="${escapeHtml(node.id)}"
                          data-kind="${escapeHtml(node.kind)}"
                        >
                          <div class="inventory-item-head">
                            <strong>${escapeHtml(node.title)}</strong>
                            <span class="inventory-item-state">${escapeHtml(node.generated ? strings.generated : strings.custom)}</span>
                          </div>
                          <span class="inventory-item-meta">${escapeHtml(node.meta || strings.pending)}</span>
                          <p class="inventory-item-note">${escapeHtml(clipText(node.note || node.meta, 120))}</p>
                          <div class="inventory-item-tags">
                            <span>${escapeHtml(strings.labels.chip[node.lane] || lane.label)}</span>
                            ${node.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
                          </div>
                        </button>
                      `
                    )
                    .join("")}
                </div>
              </section>
            `
          )
          .join("")
      )
      .join("");

    inventoryTarget.querySelectorAll("[data-node-select]").forEach((button) => {
      button.addEventListener("click", () => {
        selectNode(button.dataset.nodeSelect);
      });
    });
  };

  const renderTerraform = (model) => {
    if (!terraformOutput || !terraformStatus) {
      return;
    }

    const terraform = buildTerraformConfig(model);
    terraformOutput.innerHTML = highlightTerraformCode(terraform);
    terraformStatus.textContent = model?.nodes?.length ? strings.terraform.statusReady : strings.terraform.statusEmpty;

    if (copyTerraformButton) {
      copyTerraformButton.disabled = !model?.nodes?.length;
      copyTerraformButton.textContent = strings.terraform.copy;
    }
  };

  const getContext = (key) => diagramContexts.find((context) => context.key === key);

  const updateOpenDiagramTargets = (enabled) => {
    openDiagramTargets.forEach((target) => {
      if ("disabled" in target) {
        target.disabled = !enabled;
      }

      target.setAttribute("aria-disabled", enabled ? "false" : "true");

      if (target.hasAttribute("tabindex")) {
        target.tabIndex = enabled ? 0 : -1;
      }
    });
  };

  const applyDiagramScale = (context, scale) => {
    if (!context?.canvas || !context.scaleWrap) {
      return;
    }

    const naturalWidth = context.naturalWidth || context.canvas.scrollWidth || 0;
    const naturalHeight = context.naturalHeight || context.canvas.scrollHeight || 0;
    const safeScale = Math.max(0.18, Math.min(scale, 2));

    context.scale = safeScale;
    context.scaledWidth = naturalWidth * safeScale;
    context.scaledHeight = naturalHeight * safeScale;
    context.scaleWrap.style.width = `${context.scaledWidth}px`;
    context.scaleWrap.style.height = `${context.scaledHeight}px`;
    context.canvas.style.transform = `scale(${safeScale})`;

    if (context.key === "modal" && zoomReadout) {
      zoomReadout.textContent = `${Math.round(safeScale * 100)}%`;
    }
  };

  const fitPreviewDiagram = () => {
    const context = getContext("preview");
    if (!context?.viewport || !context.naturalWidth || !context.naturalHeight) {
      return;
    }

    const viewportWidth = Math.max(context.viewport.clientWidth - 8, 0);
    const viewportHeight = Math.max(context.viewport.clientHeight - 8, 0);
    const scale = Math.min(1, viewportWidth / context.naturalWidth, viewportHeight / context.naturalHeight);
    applyDiagramScale(context, scale || 1);
  };

  const fitModalDiagram = ({ preserveCenter = false } = {}) => {
    const context = getContext("modal");
    if (!context?.viewport || !context.naturalWidth || !context.naturalHeight) {
      return;
    }

    const viewportWidth = Math.max(context.viewport.clientWidth - 40, 0);
    const viewportHeight = Math.max(context.viewport.clientHeight - 40, 0);
    const nextScale = Math.min(1, viewportWidth / context.naturalWidth, viewportHeight / context.naturalHeight);
    const boundedScale = Math.max(0.38, nextScale || 1);

    if (preserveCenter) {
      setModalScale(boundedScale, { preserveCenter: true });
      return;
    }

    modalScale = boundedScale;
    applyDiagramScale(context, modalScale);
    context.viewport.scrollLeft = Math.max(0, (context.scaledWidth - context.viewport.clientWidth) / 2);
    context.viewport.scrollTop = 0;
  };

  const setModalScale = (nextScale, { preserveCenter = true } = {}) => {
    const context = getContext("modal");
    if (!context?.viewport || !context.naturalWidth || !context.naturalHeight) {
      return;
    }

    const previousWidth = context.scaledWidth || context.viewport.clientWidth;
    const previousHeight = context.scaledHeight || context.viewport.clientHeight;
    const centerX = preserveCenter ? (context.viewport.scrollLeft + context.viewport.clientWidth / 2) / previousWidth : 0.5;
    const centerY = preserveCenter ? (context.viewport.scrollTop + context.viewport.clientHeight / 2) / previousHeight : 0.18;

    modalScale = Math.max(0.38, Math.min(nextScale, 1.85));
    applyDiagramScale(context, modalScale);

    if (preserveCenter) {
      context.viewport.scrollLeft = Math.max(0, centerX * context.scaledWidth - context.viewport.clientWidth / 2);
      context.viewport.scrollTop = Math.max(0, centerY * context.scaledHeight - context.viewport.clientHeight / 2);
    }
  };

  const buildConnectorPath = ({ startX, startY, endX, endY, sameLane }) => {
    if (sameLane) {
      const midY = startY + (endY - startY) / 2;
      return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
    }

    const midX = startX + (endX - startX) / 2;
    return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
  };

  const drawConnectionsForContext = (context) => {
    if (!context?.board || !context.links || !context.canvas || !currentModel) {
      return;
    }

    const canvasWidth = Math.max(context.board.scrollWidth + 36, 1320);
    const canvasHeight = Math.max(context.board.scrollHeight + 36, 680);
    context.naturalWidth = canvasWidth;
    context.naturalHeight = canvasHeight;
    context.canvas.style.width = `${canvasWidth}px`;
    context.canvas.style.minHeight = `${canvasHeight}px`;
    context.links.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
    context.links.setAttribute("width", String(canvasWidth));
    context.links.setAttribute("height", String(canvasHeight));
    context.links.innerHTML = `
      <defs>
        <marker id="architecture-arrow-${context.key}" markerWidth="14" markerHeight="14" refX="11" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 14 7 L 0 14 z" fill="rgba(255, 216, 170, 0.85)"></path>
        </marker>
      </defs>
    `;

    const canvasRect = context.canvas.getBoundingClientRect();
    const nodeLookup = new Map(currentModel.nodes.map((node) => [node.id, node]));

    currentModel.nodes.forEach((node) => {
      const source = context.board.querySelector(`[data-node-id="${node.id}"]`);

      if (!source) {
        return;
      }

      const sourceRect = source.getBoundingClientRect();

      node.connections.forEach((targetId) => {
        const target = context.board.querySelector(`[data-node-id="${targetId}"]`);
        const targetNode = nodeLookup.get(targetId);

        if (!target || !targetNode) {
          return;
        }

        const targetRect = target.getBoundingClientRect();
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const sourceCenterX = sourceRect.left - canvasRect.left + sourceRect.width / 2;
        const sourceCenterY = sourceRect.top - canvasRect.top + sourceRect.height / 2;
        const targetCenterX = targetRect.left - canvasRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top - canvasRect.top + targetRect.height / 2;
        const horizontalPrimary = Math.abs(targetCenterX - sourceCenterX) >= Math.abs(targetCenterY - sourceCenterY);

        const startX = horizontalPrimary
          ? targetCenterX >= sourceCenterX
            ? sourceRect.right - canvasRect.left
            : sourceRect.left - canvasRect.left
          : sourceCenterX;
        const startY = horizontalPrimary
          ? sourceCenterY
          : targetCenterY >= sourceCenterY
            ? sourceRect.bottom - canvasRect.top
            : sourceRect.top - canvasRect.top;
        const endX = horizontalPrimary
          ? targetCenterX >= sourceCenterX
            ? targetRect.left - canvasRect.left
            : targetRect.right - canvasRect.left
          : targetCenterX;
        const endY = horizontalPrimary
          ? targetCenterY
          : targetCenterY >= sourceCenterY
            ? targetRect.top - canvasRect.top
            : targetRect.bottom - canvasRect.top;

        path.setAttribute(
          "d",
          buildConnectorPath({
            startX,
            startY,
            endX,
            endY,
            sameLane: !horizontalPrimary,
          })
        );
        path.setAttribute("marker-end", `url(#architecture-arrow-${context.key})`);
        context.links.appendChild(path);
      });
    });

    if (context.key === "preview") {
      fitPreviewDiagram();
    } else if (!architectureModal?.hidden) {
      fitModalDiagram({ preserveCenter: true });
    } else {
      applyDiagramScale(context, modalScale);
    }
  };

  const clipText = (value, limit = 108) => {
    const text = String(value || "").trim();
    if (!text) {
      return strings.pending;
    }

    return text.length > limit ? `${text.slice(0, limit - 1).trim()}...` : text;
  };

  const buildNodeMarkup = (node, interactive) => {
    const tagName = interactive ? "button" : "article";
    const actionAttributes = interactive ? `type="button" data-node-id="${escapeHtml(node.id)}"` : `data-node-id="${escapeHtml(node.id)}"`;
    const stateLabel = node.generated ? strings.generated : strings.custom;
    const groupLabel = strings.labels.groups[classifyNodeGroup(node)] || strings.labels.chip[node.lane] || node.lane;
    const noteText = clipText(node.note || node.meta);

    return `
      <${tagName}
        class="architecture-node${node.id === selectedNodeId ? " is-selected" : ""}"
        ${actionAttributes}
        data-kind="${escapeHtml(node.kind)}"
      >
        <div class="architecture-node-head">
          <span class="architecture-node-glyph" aria-hidden="true"></span>
          <div class="architecture-node-title-wrap">
            <h4 class="architecture-node-title">${escapeHtml(node.title)}</h4>
            <span class="architecture-node-chip">${escapeHtml(strings.labels.chip[node.lane] || node.lane)}</span>
          </div>
        </div>
        <p class="architecture-node-meta">${escapeHtml(node.meta || strings.pending)}</p>
        <p class="architecture-node-note">${escapeHtml(noteText)}</p>
        ${
          node.tags.length
            ? `<div class="architecture-node-tags">${node.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`
            : ""
        }
        <div class="architecture-node-footer">
          <span class="architecture-node-group">${escapeHtml(groupLabel)}</span>
          <span class="architecture-node-state">${escapeHtml(stateLabel)}</span>
        </div>
      </${tagName}>
    `;
  };

  const buildNodeStackMarkup = (nodes, interactive, extraClass = "") =>
    nodes.length
      ? `<div class="architecture-node-stack${extraClass ? ` ${extraClass}` : ""}">${nodes
          .map((node) => buildNodeMarkup(node, interactive))
          .join("")}</div>`
      : `<div class="architecture-node-stack architecture-node-stack-empty"><p class="summary-note">${escapeHtml(strings.none)}</p></div>`;

  const buildModuleMarkup = ({ title, note, nodes, interactive, tone = "default" }) => {
    if (!nodes.length) {
      return "";
    }

    return `
      <article class="architecture-module" data-tone="${escapeHtml(tone)}">
        <div class="architecture-module-head">
          <div>
            <span class="architecture-module-kicker">${escapeHtml(title)}</span>
            <p class="architecture-module-note">${escapeHtml(note)}</p>
          </div>
          <span class="architecture-module-count">${nodes.length}</span>
        </div>
        ${buildNodeStackMarkup(nodes, interactive)}
      </article>
    `;
  };

  const buildBoardMarkup = (model, interactive) => {
    const region = firstRegion(model.answers);
    const providerLabel =
      model.answers.deploymentModel === "on-prem"
        ? pageLanguage === "bg"
          ? "Частна среда"
          : "Private estate"
        : `${labelFor("primary_cloud", model.answers.primaryCloud) || "Cloud"} ${pageLanguage === "bg" ? "регион" : "region"}`;
    const boundaryLabel =
      model.answers.deploymentModel === "on-prem"
        ? pageLanguage === "bg"
          ? "Частна мрежова граница"
          : "Private network boundary"
        : pageLanguage === "bg"
          ? "VPC / мрежова граница"
          : "VPC / network boundary";
    const regionMeta = [
      labelFor("deployment_model", model.answers.deploymentModel),
      labelFor("network_topology", model.answers.networkTopology),
      labelFor("subnet_pattern", model.answers.subnetPattern),
    ]
      .filter(Boolean)
      .join(" • ");
    const hostingLabel = joinLabels(labelsFor("hosting", model.answers.hosting));
    const azChips = Array.from({ length: Math.max(model.answers.azCount || 0, 0) }, (_, index) => {
      const label =
        pageLanguage === "bg" ? `AZ ${index + 1}` : `AZ ${index + 1}`;
      return `<span class="architecture-az-chip">${escapeHtml(label)}</span>`;
    }).join("");

    const channels = model.nodes.filter((node) => node.lane === "channels");
    const edgeNodes = model.nodes.filter((node) => node.lane === "edge");
    const networkCoreNodes = model.nodes.filter(
      (node) => node.lane === "network" && classifyNodeGroup(node) === "networkCore"
    );
    const hybridNodes = model.nodes.filter(
      (node) => node.lane === "network" && classifyNodeGroup(node) === "hybridAccess"
    );
    const identityNodes = model.nodes.filter(
      (node) => node.lane === "operations" && classifyNodeGroup(node) === "securityIdentity"
    );
    const appNodes = model.nodes.filter(
      (node) => node.lane === "services" && ["appTier", "platformRuntime"].includes(classifyNodeGroup(node))
    );
    const asyncNodes = model.nodes.filter(
      (node) => node.lane === "services" && classifyNodeGroup(node) === "asyncWorkloads"
    );
    const privateDataNodes = model.nodes.filter((node) => {
      if (node.lane !== "data") {
        return false;
      }

      const text = `${node.title} ${node.meta}`.toLowerCase();
      return classifyNodeGroup(node) === "transactionalData" && !/storage|bucket|search|warehouse|vector/.test(text);
    });
    const regionalServiceNodes = model.nodes.filter((node) => {
      if (node.lane === "operations" && ["observability", "deliveryRecovery", "aiEnablement"].includes(classifyNodeGroup(node))) {
        return true;
      }

      if (node.lane !== "data") {
        return false;
      }

      const text = `${node.title} ${node.meta}`.toLowerCase();
      return ["asyncData", "analyticsAi"].includes(classifyNodeGroup(node)) || /storage|bucket|search|warehouse|vector/.test(text);
    });
    const externalNodes = model.nodes.filter(
      (node) =>
        (node.lane === "data" && classifyNodeGroup(node) === "externalSystems") ||
        (node.lane === "network" && classifyNodeGroup(node) === "hybridAccess")
    );
    const regionalMarkup =
      buildModuleMarkup({
        title: pageLanguage === "bg" ? "Regional services" : "Regional services",
        note: pageLanguage === "bg" ? "Managed messaging, storage, analytics, monitoring и recovery контроли." : "Managed messaging, storage, analytics, monitoring, and recovery controls.",
        nodes: regionalServiceNodes,
        interactive,
        tone: "regional",
      }) ||
      `
        <article class="architecture-module architecture-module-empty">
          <div class="architecture-module-head">
            <div>
              <span class="architecture-module-kicker">${escapeHtml(pageLanguage === "bg" ? "Regional services" : "Regional services")}</span>
              <p class="architecture-module-note">${escapeHtml(pageLanguage === "bg" ? "Тук ще се появят managed services слоевете, след като изберете storage, messaging, analytics или ops контроли." : "Managed services will appear here after you select storage, messaging, analytics, or operations controls.")}</p>
            </div>
          </div>
        </article>
      `;

    return `
      <div class="architecture-diagram" data-provider="${escapeHtml(slugify(model.answers.primaryCloud || "generic-cloud"))}">
        <aside class="architecture-actors-zone">
          <div class="architecture-zone-head">
            <div>
              <span class="architecture-zone-kicker">${escapeHtml(pageLanguage === "bg" ? "Канали" : "Channels")}</span>
              <h3 class="architecture-zone-title">${escapeHtml(pageLanguage === "bg" ? "Потребители и входни точки" : "Users and entry points")}</h3>
            </div>
            <p class="architecture-zone-note">${escapeHtml(pageLanguage === "bg" ? "Откъде трафикът, екипите и интеграциите влизат в системата." : "Where traffic, teams, and integrations enter the platform.")}</p>
          </div>
          ${buildNodeStackMarkup(channels, interactive)}
        </aside>

        <section class="architecture-region-shell">
          <div class="architecture-region-head">
            <div>
              <span class="architecture-zone-kicker">${escapeHtml(providerLabel)}</span>
              <h3 class="architecture-region-title">${escapeHtml(region ? `${region} • ${model.answers.systemName || strings.systemFallback}` : model.answers.systemName || strings.systemFallback)}</h3>
              <p class="architecture-zone-note">${escapeHtml(regionMeta || strings.pending)}</p>
            </div>

            <div class="architecture-region-pills">
              <span class="architecture-region-pill">${escapeHtml(labelFor("business_goal", model.answers.businessGoal) || strings.pending)}</span>
              <span class="architecture-region-pill">${escapeHtml(labelFor("autoscaling", model.answers.autoscaling) || strings.pending)}</span>
              <span class="architecture-region-pill">${escapeHtml(hostingLabel || strings.pending)}</span>
            </div>
          </div>

          <div class="architecture-diagram-grid">
            <section class="architecture-vpc-shell">
              <div class="architecture-boundary-head">
                <div>
                  <span class="architecture-zone-kicker">${escapeHtml(boundaryLabel)}</span>
                  <h3 class="architecture-zone-title">${escapeHtml(pageLanguage === "bg" ? "Приложна и data среда" : "Application and data estate")}</h3>
                </div>
                <div class="architecture-az-strip">${azChips || `<span class="architecture-az-chip">${escapeHtml(pageLanguage === "bg" ? "Сегментирана среда" : "Segmented estate")}</span>`}</div>
              </div>

              <div class="architecture-vpc-grid">
                <section class="architecture-zone-panel architecture-zone-panel-access">
                  <div class="architecture-zone-head">
                    <div>
                      <span class="architecture-zone-kicker">${escapeHtml(pageLanguage === "bg" ? "Достъп" : "Access zone")}</span>
                      <h4 class="architecture-zone-title">${escapeHtml(pageLanguage === "bg" ? "Публичен и защитен вход" : "Public and protected ingress")}</h4>
                    </div>
                    <p class="architecture-zone-note">${escapeHtml(pageLanguage === "bg" ? "Load balancer-и, API вход, VPN и мрежова основа." : "Load balancers, API entry, VPN, and network foundation.")}</p>
                  </div>
                  ${buildNodeStackMarkup([...edgeNodes, ...networkCoreNodes], interactive)}
                </section>

                <div class="architecture-private-zone">
                  ${buildModuleMarkup({
                    title: pageLanguage === "bg" ? "Идентичност и контрол" : "Identity and control plane",
                    note: pageLanguage === "bg" ? "SSO, IAM, secrets и достъп до критичните слоеве." : "SSO, IAM, secrets, and controlled access into critical layers.",
                    nodes: identityNodes,
                    interactive,
                    tone: "identity",
                  })}
                  ${buildModuleMarkup({
                    title: pageLanguage === "bg" ? "Приложен слой" : "Application services",
                    note: pageLanguage === "bg" ? "Основни уеб, API, container или Kubernetes workloads." : "Primary web, API, container, or Kubernetes workloads.",
                    nodes: appNodes,
                    interactive,
                    tone: "compute",
                  })}
                  ${buildModuleMarkup({
                    title: pageLanguage === "bg" ? "Async и jobs" : "Async and background workloads",
                    note: pageLanguage === "bg" ? "Workers, schedulers и асинхронни потоци." : "Workers, schedulers, and asynchronous processing flows.",
                    nodes: asyncNodes,
                    interactive,
                    tone: "async",
                  })}
                  ${buildModuleMarkup({
                    title: pageLanguage === "bg" ? "Частни data слоеве" : "Private data services",
                    note: pageLanguage === "bg" ? "Транзакционни бази, cache и вътрешни data зависимости." : "Transactional databases, cache, and internal data dependencies.",
                    nodes: privateDataNodes,
                    interactive,
                    tone: "data",
                  })}
                </div>
              </div>
            </section>

            <aside class="architecture-managed-zone">
              ${regionalMarkup}
            </aside>
          </div>

          ${
            externalNodes.length
              ? `
                <section class="architecture-external-zone">
                  <div class="architecture-zone-head">
                    <div>
                      <span class="architecture-zone-kicker">${escapeHtml(pageLanguage === "bg" ? "Външни зависимости" : "External resources")}</span>
                      <h3 class="architecture-zone-title">${escapeHtml(pageLanguage === "bg" ? "On-prem и свързани системи" : "On-prem and connected systems")}</h3>
                    </div>
                    <p class="architecture-zone-note">${escapeHtml(pageLanguage === "bg" ? "Хибридни връзки, customer-managed ресурси и бизнес системи." : "Hybrid links, customer-managed resources, and business systems.")}</p>
                  </div>
                  ${buildNodeStackMarkup(externalNodes, interactive, "architecture-node-stack-horizontal")}
                </section>
              `
              : ""
          }
        </section>
      </div>
    `;
  };

  const renderBoard = (model) => {
    if (model?.nodes) {
      syncLanes(model);
    }

    diagramContexts.forEach((context) => {
      if (!model.lanes.length) {
        context.board.innerHTML = `
          <div class="architecture-placeholder">
            <div class="architecture-placeholder-inner">
              <h3>${escapeHtml(strings.placeholder.title)}</h3>
              <p>${escapeHtml(strings.placeholder.body)}</p>
            </div>
          </div>
        `;
        context.links.innerHTML = "";
        context.naturalWidth = context.viewport.clientWidth || 0;
        context.naturalHeight = context.viewport.clientHeight || 0;
        applyDiagramScale(context, 1);
        return;
      }

      context.board.innerHTML = buildBoardMarkup(model, context.interactive);

      if (context.interactive) {
        context.board.querySelectorAll("[data-node-id]").forEach((button) => {
          button.addEventListener("click", () => {
            selectNode(button.dataset.nodeId);
          });
        });
      }
    });

    renderInventory(model);
    renderTerraform(model);
    updateInspector();
    updateAddNodeOptions();
    updateOpenDiagramTargets(Boolean(model.nodes.length));

    if (!model.nodes.length) {
      closeArchitectureModal();
    }

    window.requestAnimationFrame(() => {
      diagramContexts.forEach((context) => {
        drawConnectionsForContext(context);
      });
    });
  };

  const updateInspector = () => {
    if (!nodeTitleTarget || !nodeEmptyTarget || !nodeForm) {
      return;
    }

    const node = currentModel?.nodes.find((item) => item.id === selectedNodeId);

    if (!node) {
      nodeTitleTarget.textContent = strings.inspector.emptyTitle;
      nodeEmptyTarget.textContent = strings.inspector.emptyBody;
      nodeEmptyTarget.hidden = false;
      nodeForm.hidden = true;

      if (removeNodeButton) {
        removeNodeButton.hidden = true;
      }
      return;
    }

    nodeTitleTarget.textContent = node.title;
    nodeEmptyTarget.hidden = true;
    nodeForm.hidden = false;
    nodeForm.elements.namedItem("node_title").value = node.title;
    nodeForm.elements.namedItem("node_meta").value = node.meta || "";
    nodeForm.elements.namedItem("node_note").value = node.note || "";
    nodeForm.elements.namedItem("node_tags").value = node.tags.join(", ");

    if (removeNodeButton) {
      removeNodeButton.hidden = node.generated;
      removeNodeButton.textContent = strings.actions.removeComponent;
    }
  };

  const updateAddNodeOptions = () => {
    if (!addNodeForm) {
      return;
    }

    const select = addNodeForm.elements.namedItem("add_connect");

    if (!select) {
      return;
    }

    select.innerHTML = [
      `<option value="">${escapeHtml(strings.none)}</option>`,
      ...(currentModel?.nodes || []).map(
        (node) => `<option value="${escapeHtml(node.id)}">${escapeHtml(node.title)} • ${escapeHtml(strings.lanes[node.lane].label)}</option>`
      ),
    ].join("");
  };

  const renderModel = (model) => {
    syncLanes(model);
    renderSummaryGrid(model);
    renderBoard(model);

    if (architectureStatus) {
      architectureStatus.textContent = strings.stageStatus;
    }

    if (copyBriefButton) {
      copyBriefButton.disabled = !model.nodes.length;
      copyBriefButton.textContent = strings.actions.copyBrief;
    }
  };

  const selectNode = (nodeId) => {
    selectedNodeId = nodeId;
    renderBoard(currentModel || { lanes: [], nodes: [] });
    persistState();
  };

  const persistState = () => {
    safeStorage.set(
      storageKey,
      JSON.stringify({
        answers: readAnswers(),
        model: currentModel,
        selectedNodeId,
        nodeCounter,
        customCounter,
      })
    );
  };

  const buildAndRender = ({ scroll = true } = {}) => {
    currentModel = buildArchitectureModel(readAnswers());
    selectedNodeId = currentModel.nodes[0]?.id || null;
    renderModel(currentModel);
    persistState();

    if (scroll && outputSection) {
      outputSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const closeArchitectureModal = () => {
    if (!architectureModal || architectureModal.hidden) {
      return;
    }

    architectureModal.hidden = true;
    document.documentElement.classList.remove("architecture-modal-open");
    document.body.classList.remove("architecture-modal-open");

    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus({ preventScroll: true });
    }
  };

  const openArchitectureModal = () => {
    if (!architectureModal || !currentModel?.nodes?.length) {
      return;
    }

    previousActiveElement = document.activeElement;
    architectureModal.hidden = false;
    document.documentElement.classList.add("architecture-modal-open");
    document.body.classList.add("architecture-modal-open");

    window.requestAnimationFrame(() => {
      fitModalDiagram();
      getContext("modal")?.viewport?.focus({ preventScroll: true });
    });
  };

  const restoreState = () => {
    const stored = safeStorage.get(storageKey);

    if (!stored) {
      updateLiveSummary();
      renderBoard({ lanes: [], nodes: [] });
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed.answers) {
        applyAnswers(parsed.answers);
      }

      updateLiveSummary();

      if (parsed.model?.nodes) {
        currentModel = parsed.model;
        selectedNodeId = parsed.selectedNodeId || parsed.model.nodes[0]?.id || null;
        nodeCounter = Number.isFinite(parsed.nodeCounter) ? parsed.nodeCounter : parsed.model.nodes.length;
        customCounter = Number.isFinite(parsed.customCounter)
          ? parsed.customCounter
          : parsed.model.nodes.filter((node) => !node.generated).length;
        renderModel(currentModel);
        return;
      }

      renderBoard({ lanes: [], nodes: [] });
    } catch {
      updateLiveSummary();
      renderBoard({ lanes: [], nodes: [] });
    }
  };

  architectureForm.addEventListener("input", updateLiveSummary);
  architectureForm.addEventListener("change", updateLiveSummary);
  architectureForm.addEventListener("submit", (event) => {
    event.preventDefault();
    buildAndRender();
  });

  if (nodeForm) {
    nodeForm.addEventListener("input", () => {
      if (!currentModel || !selectedNodeId) {
        return;
      }

      const node = currentModel.nodes.find((item) => item.id === selectedNodeId);
      if (!node) {
        return;
      }

      node.title = nodeForm.elements.namedItem("node_title").value.trim() || node.title;
      node.meta = nodeForm.elements.namedItem("node_meta").value.trim();
      node.note = nodeForm.elements.namedItem("node_note").value.trim();
      node.tags = unique(
        nodeForm.elements
          .namedItem("node_tags")
          .value.split(",")
          .map((tag) => tag.trim())
      );

      renderBoard(currentModel);
      persistState();
    });
  }

  if (addNodeForm) {
    addNodeForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!addNodeForm.reportValidity()) {
        return;
      }

      if (!currentModel) {
        buildAndRender({ scroll: false });
      }

      if (!currentModel) {
        return;
      }

      customCounter += 1;

      const newNode = createNode({
        lane: addNodeForm.elements.namedItem("add_lane").value || "services",
        title: addNodeForm.elements.namedItem("add_title").value.trim() || `${strings.custom} ${customCounter}`,
        meta: addNodeForm.elements.namedItem("add_meta").value.trim(),
        note: addNodeForm.elements.namedItem("add_note").value.trim(),
        tags: ["Custom"],
        kind: "service",
        generated: false,
      });

      const connectFrom = addNodeForm.elements.namedItem("add_connect").value;
      if (connectFrom) {
        const source = currentModel.nodes.find((node) => node.id === connectFrom);
        if (source && !source.connections.includes(newNode.id)) {
          source.connections.push(newNode.id);
        }
      }

      currentModel.nodes.push(newNode);
      selectedNodeId = newNode.id;
      renderModel(currentModel);
      addNodeForm.reset();
      persistState();
    });
  }

  removeNodeButton?.addEventListener("click", () => {
    if (!currentModel || !selectedNodeId) {
      return;
    }

    const node = currentModel.nodes.find((item) => item.id === selectedNodeId);
    if (!node || node.generated) {
      return;
    }

    currentModel.nodes = currentModel.nodes.filter((item) => item.id !== selectedNodeId);
    currentModel.nodes.forEach((item) => {
      item.connections = item.connections.filter((targetId) => targetId !== selectedNodeId);
    });
    selectedNodeId = currentModel.nodes[0]?.id || null;
    renderModel(currentModel);
    persistState();
  });

  copyBriefButton?.addEventListener("click", async () => {
    if (!currentModel?.brief || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(currentModel.brief);
      copyBriefButton.textContent = strings.copied;
      window.setTimeout(() => {
        copyBriefButton.textContent = strings.actions.copyBrief;
      }, 1600);
    } catch {
      copyBriefButton.textContent = strings.actions.copyBrief;
    }
  });

  copyTerraformButton?.addEventListener("click", async () => {
    if (!currentModel?.nodes?.length || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(buildTerraformConfig(currentModel));
      copyTerraformButton.textContent = strings.terraform.copied;
      window.setTimeout(() => {
        copyTerraformButton.textContent = strings.terraform.copy;
      }, 1600);
    } catch {
      copyTerraformButton.textContent = strings.terraform.copy;
    }
  });

  scrollFormButton?.addEventListener("click", () => {
    architectureForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  openDiagramTargets.forEach((target) => {
    const triggerOpen = (event) => {
      if (target.getAttribute("aria-disabled") === "true" || target.disabled) {
        return;
      }

      event.preventDefault();
      openArchitectureModal();
    };

    target.addEventListener("click", triggerOpen);

    if (target.hasAttribute("tabindex")) {
      target.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          triggerOpen(event);
        }
      });
    }
  });

  closeDiagramTargets.forEach((target) => {
    target.addEventListener("click", (event) => {
      event.preventDefault();
      closeArchitectureModal();
    });
  });

  zoomInButton?.addEventListener("click", () => {
    setModalScale(modalScale + 0.12);
  });

  zoomOutButton?.addEventListener("click", () => {
    setModalScale(modalScale - 0.12);
  });

  zoomFitButton?.addEventListener("click", () => {
    fitModalDiagram();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeArchitectureModal();
    }
  });

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(() => {
      diagramContexts.forEach((context) => {
        drawConnectionsForContext(context);
      });
    });
  });

  restoreState();
}

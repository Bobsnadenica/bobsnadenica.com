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
        "The generated view stays high level on purpose: strong enough for planning, scoping, workshops, and stakeholder conversations.",
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
        "Изгледът е high level по замисъл: достатъчно силен за планиране, scoping, workshops и разговори със stakeholders.",
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
  const architectureBoard = document.querySelector("[data-architecture-board]");
  const architectureLinks = document.querySelector("[data-architecture-links]");
  const architectureStatus = document.querySelector("[data-architecture-status]");
  const inventoryTarget = document.querySelector("[data-node-list]");
  const nodeTitleTarget = document.querySelector("[data-node-title]");
  const nodeEmptyTarget = document.querySelector("[data-node-empty]");
  const nodeForm = document.querySelector("[data-node-form]");
  const addNodeForm = document.querySelector("[data-add-node-form]");
  const copyBriefButton = document.querySelector("[data-copy-brief]");
  const scrollFormButton = document.querySelector("[data-scroll-form]");
  const removeNodeButton = document.querySelector("[data-remove-node]");
  const outputSection = document.querySelector("#architecture-output");

  let currentModel = null;
  let selectedNodeId = null;
  let nodeCounter = 0;
  let customCounter = 0;

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

  const connectGroups = (fromNodes, toNodes) => {
    if (!fromNodes.length || !toNodes.length) {
      return;
    }

    const sources = fromNodes.slice(0, Math.min(3, fromNodes.length));
    toNodes.forEach((target, index) => {
      const source = sources[index % sources.length];
      if (source && !source.connections.includes(target.id)) {
        source.connections.push(target.id);
      }
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
      addSequentialConnections(nodes.filter((node) => node.lane === laneId));
    });

    const channels = nodes.filter((node) => node.lane === "channels");
    const edge = nodes.filter((node) => node.lane === "edge");
    const network = nodes.filter((node) => node.lane === "network");
    const services = nodes.filter((node) => node.lane === "services");
    const data = nodes.filter((node) => node.lane === "data");
    const operations = nodes.filter((node) => node.lane === "operations");

    connectGroups(channels, edge.length ? edge : network);
    connectGroups(edge, network.length ? network : services);
    connectGroups(network.length ? network : edge, services);
    connectGroups(services, data);
    connectGroups(services.slice(0, Math.min(3, services.length)), operations);
    connectGroups(data.slice(0, Math.min(2, data.length)), operations);

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

  const renderInventory = (model) => {
    if (!inventoryTarget) {
      return;
    }

    if (!model.nodes.length) {
      inventoryTarget.innerHTML = `<p class="summary-note">${escapeHtml(strings.inspector.inventoryEmpty)}</p>`;
      return;
    }

    inventoryTarget.innerHTML = model.nodes
      .map(
        (node) => `
          <button class="inventory-item${node.id === selectedNodeId ? " is-selected" : ""}" type="button" data-node-select="${escapeHtml(node.id)}">
            <em>${escapeHtml(strings.lanes[node.lane].label)} • ${escapeHtml(node.generated ? strings.generated : strings.custom)}</em>
            <strong>${escapeHtml(node.title)}</strong>
            <span>${escapeHtml(node.meta || node.note || strings.pending)}</span>
          </button>
        `
      )
      .join("");

    inventoryTarget.querySelectorAll("[data-node-select]").forEach((button) => {
      button.addEventListener("click", () => {
        selectNode(button.dataset.nodeSelect);
      });
    });
  };

  const drawConnections = () => {
    if (!architectureBoard || !architectureLinks || !currentModel) {
      return;
    }

    const wrapRect = architectureBoard.getBoundingClientRect();
    architectureLinks.setAttribute("viewBox", `0 0 ${wrapRect.width} ${wrapRect.height}`);
    architectureLinks.innerHTML = "";

    currentModel.nodes.forEach((node) => {
      const source = architectureBoard.querySelector(`[data-node-id="${node.id}"]`);

      if (!source) {
        return;
      }

      const sourceRect = source.getBoundingClientRect();
      const startX = sourceRect.right - wrapRect.left;
      const startY = sourceRect.top - wrapRect.top + sourceRect.height / 2;

      node.connections.forEach((targetId) => {
        const target = architectureBoard.querySelector(`[data-node-id="${targetId}"]`);

        if (!target) {
          return;
        }

        const targetRect = target.getBoundingClientRect();
        const endX = targetRect.left - wrapRect.left;
        const endY = targetRect.top - wrapRect.top + targetRect.height / 2;
        const curve = Math.max(48, Math.abs(endX - startX) * 0.42);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute(
          "d",
          `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`
        );
        architectureLinks.appendChild(path);
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

  const renderBoard = (model) => {
    if (!architectureBoard) {
      return;
    }

    if (!model.lanes.length) {
      architectureBoard.innerHTML = `
        <div class="architecture-placeholder">
          <div class="architecture-placeholder-inner">
            <h3>${escapeHtml(strings.placeholder.title)}</h3>
            <p>${escapeHtml(strings.placeholder.body)}</p>
          </div>
        </div>
      `;

      if (architectureLinks) {
        architectureLinks.innerHTML = "";
      }

      renderInventory(model);
      updateInspector();
      return;
    }

    architectureBoard.innerHTML = model.lanes
      .map(
        (lane) => `
          <section class="architecture-lane">
            <div class="architecture-lane-head">
              <div>
                <h3 class="architecture-lane-title">${escapeHtml(lane.label)}</h3>
                <p class="architecture-lane-note">${escapeHtml(lane.note)}</p>
              </div>
              <span class="architecture-lane-count">${lane.nodes.length}</span>
            </div>
            <div class="architecture-nodes">
              ${lane.nodes
                .map(
                  (node) => `
                    <button
                      class="architecture-node${node.id === selectedNodeId ? " is-selected" : ""}"
                      type="button"
                      data-node-id="${escapeHtml(node.id)}"
                      data-kind="${escapeHtml(node.kind)}"
                    >
                      <div class="architecture-node-head">
                        <h4 class="architecture-node-title">${escapeHtml(node.title)}</h4>
                        <span class="architecture-node-chip">${escapeHtml(strings.labels.chip[node.lane] || node.lane)}</span>
                      </div>
                      <p class="architecture-node-meta">${escapeHtml(node.meta || strings.pending)}</p>
                      <p class="architecture-node-note">${escapeHtml(node.note || strings.pending)}</p>
                      ${
                        node.tags.length
                          ? `<div class="architecture-node-tags">${node.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`
                          : ""
                      }
                    </button>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      )
      .join("");

    architectureBoard.querySelectorAll("[data-node-id]").forEach((button) => {
      button.addEventListener("click", () => {
        selectNode(button.dataset.nodeId);
      });
    });

    renderInventory(model);
    updateInspector();
    updateAddNodeOptions();
    window.requestAnimationFrame(drawConnections);
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

  scrollFormButton?.addEventListener("click", () => {
    architectureForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(drawConnections);
  });

  restoreState();
}

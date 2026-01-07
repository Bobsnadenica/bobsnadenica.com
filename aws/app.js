<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tech Knowledge Hub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <header class="hero">
    <div class="hero-inner">
      <h1>Tech Knowledge Hub</h1>
      <p class="subtitle">
        A structured reference for core technology concepts, abbreviations,
        architectures, and engineering best practices.
      </p>
      <p class="hero-note">
        Designed for clarity, correctness, and real‑world usage.
      </p>
    </div>
  </header>

  <main class="container">

    <section class="intro">
      <p>
        This hub answers common technical questions such as
        <strong>“What is NAT?”</strong>,
        <strong>“What is DNS?”</strong>,
        <strong>“What is CloudFormation?”</strong> and many more.
      </p>
      <p>
        Each topic is isolated into its own page for deep dives,
        diagrams, examples, and practical considerations.
      </p>
    </section>

    <section>
      <h2>⭐ Popular Tech Concepts</h2>
      <p class="section-desc">
        Frequently referenced terms that appear across cloud, networking,
        and application architecture.
      </p>

      <div class="grid">
        <div class="topic-card">
          <span class="badge">Core</span>
          <h3>NAT (Network Address Translation)</h3>
          <p>
            Allows private systems to access external networks without
            being directly reachable from the internet.
          </p>
        </div>

        <div class="topic-card">
          <span class="badge">Core</span>
          <h3>DNS (Domain Name System)</h3>
          <p>
            Translates human‑readable domain names into IP addresses
            used by computers.
          </p>
        </div>

        <div class="topic-card">
          <span class="badge cloud">IaC</span>
          <h3>Infrastructure as Code</h3>
          <p>
            Managing infrastructure using declarative configuration
            instead of manual setup.
          </p>
        </div>

        <div class="topic-card">
          <span class="badge eng">Architecture</span>
          <h3>Load Balancing</h3>
          <p>
            Distributes incoming traffic across multiple systems
            to improve availability and performance.
          </p>
        </div>

        <div class="topic-card">
          <span class="badge data">Data</span>
          <h3>Database</h3>
          <p>
            A system designed to reliably store, query, and update data
            at scale.
          </p>
        </div>

        <div class="topic-card">
          <span class="badge security">Security</span>
          <h3>IAM</h3>
          <p>
            Controls who can access systems, services, and data,
            and what actions they are allowed to perform.
          </p>
        </div>
      </div>
    </section>

    <section>
      <h2>🌐 Networking</h2>
      <p class="section-desc">How systems communicate and move data.</p>

      <div class="grid">
        <a class="topic-card" href="nat.html">
          <span class="badge">Networking</span>
          <h3>What is NAT?</h3>
          <p>Private networking and controlled internet access</p>
        </a>

        <a class="topic-card" href="dns.html">
          <span class="badge">Networking</span>
          <h3>What is DNS?</h3>
          <p>Name resolution and service discovery</p>
        </a>

        <a class="topic-card" href="tcp-udp.html">
          <span class="badge">Networking</span>
          <h3>TCP vs UDP</h3>
          <p>Reliability, ordering, and latency trade‑offs</p>
        </a>

        <a class="topic-card" href="load-balancer.html">
          <span class="badge">Networking</span>
          <h3>Load Balancer</h3>
          <p>Traffic distribution and availability</p>
        </a>
      </div>
    </section>

    <section>
      <h2>☁️ Cloud & Infrastructure</h2>
      <p class="section-desc">Foundational building blocks of cloud systems.</p>

      <div class="grid">
        <a class="topic-card" href="cloudformation.html">
          <span class="badge cloud">IaC</span>
          <h3>What is CloudFormation?</h3>
          <p>AWS-native Infrastructure as Code</p>
        </a>

        <a class="topic-card" href="terraform.html">
          <span class="badge cloud">IaC</span>
          <h3>What is Terraform?</h3>
          <p>Declarative, multi‑cloud infrastructure</p>
        </a>

        <a class="topic-card" href="vpc.html">
          <span class="badge cloud">Cloud</span>
          <h3>What is a VPC?</h3>
          <p>Isolated virtual networking</p>
        </a>

        <a class="topic-card" href="subnets.html">
          <span class="badge cloud">Cloud</span>
          <h3>What are Subnets?</h3>
          <p>Network segmentation and routing</p>
        </a>
      </div>
    </section>

    <section>
      <h2>💾 Data & Storage</h2>
      <p class="section-desc">How data is stored, queried, and protected.</p>

      <div class="grid">
        <a class="topic-card" href="database.html">
          <span class="badge data">Data</span>
          <h3>What is a Database?</h3>
          <p>Persistent structured and unstructured data</p>
        </a>

        <a class="topic-card" href="sql-nosql.html">
          <span class="badge data">Data</span>
          <h3>SQL vs NoSQL</h3>
          <p>Relational versus non‑relational models</p>
        </a>

        <a class="topic-card" href="backups.html">
          <span class="badge data">Reliability</span>
          <h3>Backups & Recovery</h3>
          <p>Data durability and restoration strategies</p>
        </a>
      </div>
    </section>

    <section>
      <h2>🔐 Security & Reliability</h2>
      <p class="section-desc">Protecting systems and planning for failure.</p>

      <div class="grid">
        <a class="topic-card" href="iam.html">
          <span class="badge security">Security</span>
          <h3>What is IAM?</h3>
          <p>Identity, authentication, and authorization</p>
        </a>

        <a class="topic-card" href="encryption.html">
          <span class="badge security">Security</span>
          <h3>Encryption</h3>
          <p>Protecting data in transit and at rest</p>
        </a>

        <a class="topic-card" href="disaster-recovery.html">
          <span class="badge security">Reliability</span>
          <h3>Disaster Recovery</h3>
          <p>Resilience, RTO, and RPO</p>
        </a>
      </div>
    </section>

    <section>
      <h2>⚙️ Engineering Practices</h2>
      <p class="section-desc">How modern systems are built and operated.</p>

      <div class="grid">
        <a class="topic-card" href="ci-cd.html">
          <span class="badge eng">Engineering</span>
          <h3>CI / CD</h3>
          <p>Automated testing and deployment</p>
        </a>

        <a class="topic-card" href="monitoring.html">
          <span class="badge eng">Engineering</span>
          <h3>Monitoring & Logs</h3>
          <p>Observability and incident response</p>
        </a>

        <a class="topic-card" href="scaling.html">
          <span class="badge eng">Engineering</span>
          <h3>Scaling Systems</h3>
          <p>Handling growth and load safely</p>
        </a>
      </div>
    </section>

  </main>

  <footer>
    <p>Tech Knowledge Hub — a living reference for real‑world systems.</p>
  </footer>

</body>
</html>

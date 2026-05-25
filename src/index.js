const http = require('http');

const PORT = process.env.PORT || 3000;
const APP  = process.env.OTEL_SERVICE_NAME || 'my-app';
const ENV  = process.env.DEPLOYMENT_ENV   || 'dev';

const CLUSTER_IP    = process.env.CLUSTER_IP || '135.181.177.246';
const ARGOCD_URL    = 'https://argocd.easy-deploy.' + CLUSTER_IP + '.nip.io';
const INFISICAL_URL = 'https://infisical.easy-deploy.' + CLUSTER_IP + '.nip.io';
const GRAFANA_URL   = 'https://shanzindlr.grafana.net';
const PORTAL_URL    = 'https://portal-dev.easy-deploy.' + CLUSTER_IP + '.nip.io';
const DEV_URL       = 'https://' + APP + '-dev.easy-deploy.' + CLUSTER_IP + '.nip.io';
const PROD_URL      = 'https://' + APP + '.easy-deploy.' + CLUSTER_IP + '.nip.io';
const ARGOCD_APP    = ARGOCD_URL + '/applications/' + APP + '-dev';
const GRAFANA_DASH  = GRAFANA_URL + '/d/easydeploy-' + APP + '/' + APP;
const REPO_URL      = 'https://github.com/easydeploytest/' + APP;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${APP} — EasyDeploy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Red+Hat+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary:       #1456E0;
      --primary-dark:  #0D2497;
      --primary-light: #E7EEFC;
      --primary-muted: #A1BCF3;
      --text:          #092241;
      --text-2:        rgba(9,34,65,.75);
      --bg:            #F5F7FE;
      --white:         #FFFFFF;
      --border:        #D0DAF5;
      --green:         #22c55e;
      --font-h: 'Red Hat Display', sans-serif;
      --font-b: 'Open Sans', sans-serif;
      --sidebar: 224px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-b); background: var(--bg); color: var(--text); font-size: 14px; line-height: 20px; }

    /* sidebar */
    .sidebar {
      position: fixed; top: 0; left: 0; width: var(--sidebar); height: 100vh;
      background: linear-gradient(0deg, var(--primary-dark) 0%, var(--primary) 100%);
      display: flex; flex-direction: column; z-index: 50;
    }
    .sb-logo { height: 96px; display: flex; align-items: center; padding: 0 20px; gap: 10px; }
    .sb-logo svg { width: 28px; height: 28px; flex-shrink: 0; }
    .sb-logo-name { font-family: var(--font-h); font-size: 14px; font-weight: 700; color: #fff; }
    .sb-logo-sub  { font-size: 11px; color: var(--primary-muted); margin-top: 1px; }
    .sb-hr { width: 100%; height: 1px; background: rgba(255,255,255,.2); border: none; }
    .sb-link {
      display: flex; align-items: center; width: 100%; height: 48px;
      text-decoration: none; color: var(--primary-muted);
      font-size: 14px; font-family: var(--font-b); border: none; background: none; cursor: pointer;
      transition: color .15s, background .15s;
    }
    .sb-link:hover, .sb-link.active { color: #fff; background: rgba(255,255,255,.12); }
    .sb-icon { width: 72px; height: 48px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    /* live badge in sidebar */
    .env-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,.15); border-radius: 20px;
      padding: 3px 10px; font-size: 11px; font-weight: 600; color: #fff;
      margin: 0 16px 16px;
    }
    .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); }

    /* main */
    .main { padding-left: var(--sidebar); min-height: 100vh; }
    .page-header { padding: 28px 32px 16px; }
    h1 { font-family: var(--font-h); font-size: 32px; font-weight: 700; color: var(--text); }
    .page-sub { font-size: 14px; font-weight: 500; color: var(--text-2); margin-top: 8px; }
    .page-body { padding: 8px 32px 48px; display: flex; flex-direction: column; gap: 32px; }

    /* section */
    .section-title { font-family: var(--font-h); font-size: 20px; font-weight: 700; color: var(--primary); margin-bottom: 16px; }
    .card { background: var(--white); border-radius: 12px; padding: 24px; }

    /* links grid */
    .links-grid { display: flex; flex-wrap: wrap; gap: 12px; }
    .link-tile {
      display: flex; flex-direction: column; gap: 4px;
      background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 14px 18px; text-decoration: none; min-width: 200px; flex: 1;
      transition: border-color .15s;
    }
    .link-tile:hover { border-color: var(--primary); }
    .lt-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--primary-muted); }
    .lt-url   { font-size: 13px; color: var(--primary); font-family: monospace; word-break: break-all; }

    /* steps */
    .steps { display: flex; flex-direction: column; gap: 0; }
    .step { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid #F0F3FD; }
    .step:last-child { border-bottom: none; }
    .step-num {
      width: 28px; height: 28px; border-radius: 50%; background: var(--primary);
      color: #fff; font-family: var(--font-h); font-weight: 700; font-size: 13px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
    }
    .step-body { flex: 1; }
    .step-title { font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 6px; }
    .step-desc  { font-size: 13px; color: var(--text-2); line-height: 1.6; }

    /* code blocks */
    pre {
      background: #0d1117; color: #e6edf3; border-radius: 8px;
      padding: 14px 16px; font-size: 12px; line-height: 1.6;
      overflow-x: auto; margin: 8px 0; font-family: 'Courier New', monospace;
    }
    code { font-family: 'Courier New', monospace; font-size: 12px; background: var(--primary-light); color: var(--primary); padding: 1px 5px; border-radius: 4px; }

    /* runtime tabs */
    .tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .tab {
      padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;
      cursor: pointer; border: 1px solid var(--border); background: var(--bg); color: var(--text-2);
      transition: all .15s;
    }
    .tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }
    .runtime { display: none; }
    .runtime.active { display: block; }

    /* table */
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--text-2); padding: 8px 12px; border-bottom: 2px solid var(--border); }
    td { padding: 10px 12px; border-bottom: 1px solid #F0F3FD; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .var-name { font-family: monospace; color: var(--primary); font-weight: 600; }
    .req-badge { background: #FFF0F3; color: #c0003a; border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 700; }
    .opt-badge { background: var(--primary-light); color: var(--primary); border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 700; }

    /* warning box */
    .warn { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #92400E; margin-bottom: 16px; line-height: 1.6; }
    .info { background: var(--primary-light); border-left: 4px solid var(--primary); border-radius: 8px; padding: 14px 16px; font-size: 13px; color: var(--primary-dark); margin-bottom: 16px; line-height: 1.6; }
  </style>
</head>
<body>

<nav class="sidebar">
  <div class="sb-logo">
    <svg viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="rgba(255,255,255,.15)"/>
      <path d="M6 14L11 9L16 14L11 19Z" fill="white" opacity=".7"/>
      <path d="M12 14L17 9L22 14L17 19Z" fill="white"/>
    </svg>
    <div>
      <div class="sb-logo-name">EasyDeploy</div>
      <div class="sb-logo-sub">${APP}</div>
    </div>
  </div>
  <hr class="sb-hr">
  <a class="sb-link active" href="/">
    <div class="sb-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10.5 1.5a.75.75 0 0 0-1 0L2 8.25V17a1 1 0 0 0 1 1h4v-5h6v5h4a1 1 0 0 0 1-1V8.25L10.5 1.5z"/></svg></div>
    <span>Setup guide</span>
  </a>
  <a class="sb-link" href="${ARGOCD_APP}" target="_blank">
    <div class="sb-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg></div>
    <span>ArgoCD</span>
  </a>
  <a class="sb-link" href="${GRAFANA_DASH}" target="_blank">
    <div class="sb-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="2,14 7,8 11,11 18,4"/><polyline points="15,4 18,4 18,7"/></svg></div>
    <span>Grafana</span>
  </a>
  <a class="sb-link" href="${INFISICAL_URL}" target="_blank">
    <div class="sb-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M8 9V6a2 2 0 0 1 4 0v3"/></svg></div>
    <span>Secrets</span>
  </a>
  <a class="sb-link" href="${PORTAL_URL}" target="_blank">
    <div class="sb-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="16" height="14" rx="2"/><path d="M6 7h8M6 11h5"/></svg></div>
    <span>Portal</span>
  </a>
  <div style="margin-top:auto">
    <hr class="sb-hr" style="margin-bottom:12px">
    <div class="env-badge"><span class="badge-dot"></span>${ENV}</div>
  </div>
</nav>

<div class="main">
  <header class="page-header">
    <h1>🚀 ${APP} is live</h1>
    <p class="page-sub">This is the EasyDeploy template app. Replace it with your own code — everything else is already wired up.</p>
  </header>

  <div class="page-body">

    <!-- Links -->
    <section>
      <div class="section-title">Your endpoints &amp; services</div>
      <div class="card">
        <div class="links-grid">
          <a class="link-tile" href="${DEV_URL}" target="_blank">
            <span class="lt-label">Dev URL</span>
            <span class="lt-url">${DEV_URL.replace('https://','')}</span>
          </a>
          <a class="link-tile" href="${PROD_URL}" target="_blank">
            <span class="lt-label">Prod URL</span>
            <span class="lt-url">${PROD_URL.replace('https://','')}</span>
          </a>
          <a class="link-tile" href="${ARGOCD_APP}" target="_blank">
            <span class="lt-label">ArgoCD</span>
            <span class="lt-url">Deployment status &amp; history</span>
          </a>
          <a class="link-tile" href="${GRAFANA_DASH}" target="_blank">
            <span class="lt-label">Grafana dashboard</span>
            <span class="lt-url">Metrics, logs, traces</span>
          </a>
          <a class="link-tile" href="${INFISICAL_URL}" target="_blank">
            <span class="lt-label">Infisical — project: ${APP}</span>
            <span class="lt-url">Environment variables &amp; secrets</span>
          </a>
          <a class="link-tile" href="${REPO_URL}" target="_blank">
            <span class="lt-label">GitHub repo</span>
            <span class="lt-url">${REPO_URL}</span>
          </a>
          <a class="link-tile" href="${PORTAL_URL}" target="_blank">
            <span class="lt-label">Deploy a new app</span>
            <span class="lt-url">Create another app from the portal</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Deploy your app -->
    <section>
      <div class="section-title">Deploy your app</div>
      <div class="card">
        <div class="tabs" style="margin-bottom:20px">
          <button class="tab active" onclick="showPath('existing')">I already have an app</button>
          <button class="tab" onclick="showPath('fresh')">I'm starting fresh</button>
        </div>

        <!-- Existing app path -->
        <div id="path-existing" class="deploy-path">
          <div class="steps">
            <div class="step">
              <div class="step-num">1</div>
              <div class="step-body">
                <div class="step-title">Add a <code>/healthz</code> endpoint</div>
                <div class="step-desc">
                  Must return HTTP 200. That's the only platform requirement.
                  <pre># Node.js
if (req.url === '/healthz') {
  res.writeHead(200); res.end('{"status":"ok"}'); return;
}

# Python / FastAPI
@app.get("/healthz")
def health(): return {"status": "ok"}

# Go
mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
  w.Write([]byte(\`{"status":"ok"}\`))
})</pre>
                </div>
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div class="step-body">
                <div class="step-title">Clone this repo and copy your code in</div>
                <div class="step-desc">
                  This repo is already wired up — CI, ArgoCD, Infisical, <code>app.yaml</code>. Just bring your source files.
                  <pre>git clone ${REPO_URL}
cd ${APP}
# copy your src/ and Dockerfile from your existing project
# do NOT copy app.yaml — it's already configured</pre>
                </div>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div class="step-body">
                <div class="step-title">Push</div>
                <div class="step-desc">
                  <pre>git add -A
git commit -m "feat: initial deploy"
git push origin main</pre>
                  Watch progress at <a href="${ARGOCD_APP}" target="_blank" style="color:var(--primary)">ArgoCD</a> or the <a href="${PORTAL_URL}" target="_blank" style="color:var(--primary)">portal</a>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Starting fresh path -->
        <div id="path-fresh" class="deploy-path" style="display:none">
          <div class="steps">
            <div class="step">
              <div class="step-num">1</div>
              <div class="step-body">
                <div class="step-title">Clone this repo</div>
                <div class="step-desc">
                  Everything is already wired up — CI, ArgoCD, Infisical. Just replace the code.
                  <pre>git clone ${REPO_URL}
cd ${APP}</pre>
                </div>
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div class="step-body">
                <div class="step-title">Replace <code>src/</code> and update the <code>Dockerfile</code></div>
                <div class="step-desc">
                  Delete the template files in <code>src/</code> and add your own. Update the <code>Dockerfile</code> to build your app. The only requirements: expose the correct port and have a <code>/healthz</code> endpoint that returns HTTP 200.
                </div>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div class="step-body">
                <div class="step-title">Push</div>
                <div class="step-desc">
                  <pre>git add -A
git commit -m "feat: replace template with my app"
git push</pre>
                  Watch progress at <a href="${ARGOCD_APP}" target="_blank" style="color:var(--primary)">ArgoCD</a> or the <a href="${PORTAL_URL}" target="_blank" style="color:var(--primary)">portal</a>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Secrets -->
    <section>
      <div class="section-title">Environment variables &amp; secrets</div>
      <div class="card">
        <div class="info">Secrets are managed in <strong>Infisical</strong>, not in code or CI. They are injected into your pods as environment variables automatically — no redeploy needed when you change them (updated within ~5 minutes).</div>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-body">
              <div class="step-title">Open Infisical</div>
              <div class="step-desc">Go to <a href="${INFISICAL_URL}" target="_blank" style="color:var(--primary)">${INFISICAL_URL}</a> → project <strong>${APP}</strong></div>
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-body">
              <div class="step-title">Add secrets per environment</div>
              <div class="step-desc">Use the <strong>dev</strong> environment for dev deployments and <strong>prod</strong> for production. Secrets in each environment are scoped — <code>prod</code> secrets are never visible in dev pods.</div>
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-body">
              <div class="step-title">Use them in your app</div>
              <div class="step-desc">Read them as normal environment variables: <code>process.env.MY_SECRET</code> / <code>os.environ["MY_SECRET"]</code> / <code>os.Getenv("MY_SECRET")</code></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Observability -->
    <section>
      <div class="section-title">Observability — OpenTelemetry setup</div>
      <div class="card">
        <p style="margin-bottom:16px;font-size:13px;color:var(--text-2)">
          The OTel Operator is installed. For <strong>Node.js, Java, Python, and .NET</strong> the operator injects the agent into your pod automatically — no code changes needed.
          For <strong>Go and Bun</strong> auto-injection is not supported; add the SDK manually instead.
        </p>
        <p style="margin-bottom:16px;font-size:13px;color:var(--text-2)">
          The following env vars are pre-set in every pod:
        </p>
        <table style="margin-bottom:24px">
          <thead><tr><th>Variable</th><th>Value</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td class="var-name">OTEL_SERVICE_NAME</td><td><code>${APP}</code></td><td>Auto-set by Helm chart</td></tr>
            <tr><td class="var-name">OTEL_EXPORTER_OTLP_ENDPOINT</td><td><em>cluster-internal collector</em></td><td>Auto-set by Helm chart</td></tr>
            <tr><td class="var-name">OTEL_EXPORTER_OTLP_PROTOCOL</td><td><code>http/protobuf</code></td><td>Auto-set by Helm chart</td></tr>
          </tbody>
        </table>

        <div class="tabs">
          <button class="tab active" onclick="showRuntime('node')">Node.js</button>
          <button class="tab" onclick="showRuntime('java')">Java</button>
          <button class="tab" onclick="showRuntime('python')">Python</button>
          <button class="tab" onclick="showRuntime('bun')">Bun</button>
          <button class="tab" onclick="showRuntime('go')">Go</button>
        </div>

        <div id="rt-node" class="runtime active">
          <div class="info" style="margin-bottom:12px">
            <strong>Auto-instrumented.</strong> The operator already injects the Node.js OTel agent — HTTP, DB, and outgoing requests are traced with zero code changes.
          </div>
          <div class="step-title" style="margin-bottom:8px">Structured logs (stdout → Loki)</div>
          <pre>const log = (level, message, extra = {}) =>
  console.log(JSON.stringify({ level, message, app: process.env.OTEL_SERVICE_NAME, ...extra }))

log('info', 'server started', { port: 3000 })
log('error', 'something failed', { error: err.message })</pre>
          <div class="step-title" style="margin:12px 0 8px">Custom spans (optional)</div>
          <pre>const { trace, SpanStatusCode } = require('@opentelemetry/api');
const tracer = trace.getTracer('${APP}');

async function myOp() {
  return tracer.startActiveSpan('my-op', async span => {
    try {
      // ... your code
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}</pre>
        </div>

        <div id="rt-java" class="runtime">
          <div class="info" style="margin-bottom:12px">
            <strong>Auto-instrumented.</strong> Set <code>otel.runtime: java</code> in <code>app.yaml</code> — the operator injects the Java agent jar. No code changes needed.
          </div>
          <div class="step-title" style="margin-bottom:8px">In <code>app.yaml</code></div>
          <pre>name: ${APP}
port: 8080
otel:
  runtime: java</pre>
          <div class="step-title" style="margin:12px 0 8px">Structured logs (stdout → Loki)</div>
          <pre>import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

var mapper = new ObjectMapper();
System.out.println(mapper.writeValueAsString(Map.of(
    "level", "info", "message", "server started",
    "app", System.getenv("OTEL_SERVICE_NAME")
)));</pre>
        </div>

        <div id="rt-python" class="runtime">
          <div class="info" style="margin-bottom:12px">
            <strong>Auto-instrumented.</strong> Set <code>otel.runtime: python</code> in <code>app.yaml</code> — the operator wraps your process with <code>opentelemetry-instrument</code>. No code changes needed.
          </div>
          <div class="step-title" style="margin-bottom:8px">In <code>app.yaml</code></div>
          <pre>name: ${APP}
port: 3000
otel:
  runtime: python</pre>
          <div class="step-title" style="margin:12px 0 8px">Structured logs (stdout → Loki)</div>
          <pre>import json, os

def log(level, message, **extra):
    print(json.dumps({"level": level, "message": message,
        "app": os.environ.get("OTEL_SERVICE_NAME"), **extra}))

log("info", "server started", port=3000)</pre>
        </div>

        <div id="rt-bun" class="runtime">
          <div class="warn" style="margin-bottom:12px">
            <strong>Manual SDK required.</strong> Bun is not compatible with the Node.js OTel operator injector. Add the SDK to your code and set <code>otel.runtime: none</code> in <code>app.yaml</code>.
          </div>
          <div class="step-title" style="margin-bottom:8px">In <code>app.yaml</code></div>
          <pre>name: ${APP}
port: 3000
otel:
  runtime: none</pre>
          <div class="step-title" style="margin:12px 0 8px">1. Install packages</div>
          <pre>bun add @opentelemetry/sdk-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http \
  @opentelemetry/sdk-metrics</pre>
          <div class="step-title" style="margin:12px 0 8px">2. Create <code>src/instrumentation.ts</code></div>
          <pre>import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 15_000,
  }),
});
sdk.start();
process.on('SIGTERM', () => sdk.shutdown());</pre>
          <div class="step-title" style="margin:12px 0 8px">3. Import first in <code>src/index.ts</code></div>
          <pre>import './instrumentation'; // must be first import

// ... your app</pre>
          <div class="step-title" style="margin:12px 0 8px">Structured logs</div>
          <pre>const log = (level: string, message: string, extra = {}) =>
  console.log(JSON.stringify({ level, message, app: process.env.OTEL_SERVICE_NAME, ...extra }));

log('info', 'server started', { port: 3000 });</pre>
        </div>

        <div id="rt-go" class="runtime">
          <div class="warn" style="margin-bottom:12px">
            <strong>Manual SDK required.</strong> Go eBPF auto-instrumentation is not enabled. Add the SDK to your code and set <code>otel.runtime: none</code> in <code>app.yaml</code>.
          </div>
          <div class="step-title" style="margin-bottom:8px">In <code>app.yaml</code></div>
          <pre>name: ${APP}
port: 3000
otel:
  runtime: none</pre>
          <div class="step-title" style="margin:12px 0 8px">1. Add dependencies</div>
          <pre>go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/sdk/trace \
  go.opentelemetry.io/otel/sdk/metric \
  go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp \
  go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp \
  go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp</pre>
          <div class="step-title" style="margin:12px 0 8px">2. Create <code>telemetry.go</code></div>
          <pre>package main

import (
    "context"
    "time"
    "go.opentelemetry.io/otel"
    otlptracehttp "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
    otlpmetrichttp "go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
    sdkmetric "go.opentelemetry.io/otel/sdk/metric"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func setupTelemetry(ctx context.Context) func() {
    traceExp, _ := otlptracehttp.New(ctx)
    tp := sdktrace.NewTracerProvider(sdktrace.WithBatcher(traceExp))
    otel.SetTracerProvider(tp)

    metricExp, _ := otlpmetrichttp.New(ctx)
    mp := sdkmetric.NewMeterProvider(sdkmetric.WithReader(
        sdkmetric.NewPeriodicReader(metricExp, sdkmetric.WithInterval(15*time.Second)),
    ))
    otel.SetMeterProvider(mp)

    return func() { tp.Shutdown(ctx); mp.Shutdown(ctx) }
}</pre>
          <div class="step-title" style="margin:12px 0 8px">3. Wrap HTTP handler</div>
          <pre>import "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"

func main() {
    shutdown := setupTelemetry(context.Background())
    defer shutdown()

    mux := http.NewServeMux()
    mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte(\`{"status":"ok"}\`))
    })
    http.ListenAndServe(":3000", otelhttp.NewHandler(mux, "server"))
}</pre>
        </div>
      </div>
    </section>

    <!-- Deploy to prod -->
    <section>
      <div class="section-title">Deploy to production</div>
      <div class="card">
        <div class="info">Prod deploys are triggered by a version tag push, not pushes to main. This prevents accidental production deployments.</div>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-body">
              <div class="step-title">Verify dev first</div>
              <div class="step-desc">All prod deploys re-tag the image already running on dev. Verify <a href="${DEV_URL}" target="_blank" style="color:var(--primary)">dev</a> before promoting.</div>
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-body">
              <div class="step-title">Push a version tag</div>
              <div class="step-desc">
                Semver tag (e.g. <code>v1.0.0</code>). The platform re-tags the dev image with this version and ArgoCD syncs the prod namespace.
                <pre>git tag v1.0.0 && git push origin v1.0.0</pre>
              </div>
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-body">
              <div class="step-title">Prod is live</div>
              <div class="step-desc">
                Prod URL: <a href="${PROD_URL}" target="_blank" style="color:var(--primary)">${PROD_URL}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</div>

<script>
function showRuntime(id) {
  document.querySelectorAll('.runtime').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById('rt-' + id).classList.add('active');
  event.target.classList.add('active');
}
function showPath(id) {
  document.querySelectorAll('.deploy-path').forEach(el => el.style.display = 'none');
  document.getElementById('path-' + id).style.display = 'block';
  event.target.closest('.tabs').querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});

server.listen(PORT, () => {
  console.log(JSON.stringify({ level: 'info', message: 'server started', app: APP, port: PORT, env: ENV }));
});

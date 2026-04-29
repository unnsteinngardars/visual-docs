<script setup>
// Single-topic explainer — content inline, no JSON file.
</script>

<template>
  <div class="page-shell" style="--accent: #4f8cc9">
    <div class="page">
      <header class="hdr">
        <div class="icon">🛡</div>
        <div>
          <h1>Security Operations Center (SOC)</h1>
          <div class="sub">
            The team, process, and tooling that turns a stream of alerts
            into detected, contained, and remediated incidents.
          </div>
        </div>
      </header>

      <div class="callout">
        <strong>Mental model</strong>
        A SOC is the <em>nervous system</em> of an organisation's
        defence: sensors generate signals, analysts interpret them, and
        responders act. People + Process + Technology — none of the three
        works without the other two.
      </div>

      <!-- What is a SOC -->
      <section class="section">
        <h2>What is a SOC?</h2>
        <p class="prose">
          A Security Operations Center is a centralised function — a
          team, a room, or a virtual collective — responsible for
          continuously monitoring, detecting, analysing, and responding
          to cybersecurity events. The mission is simple to state and
          hard to deliver: <strong>shrink the time between an attacker
          landing and the organisation knowing it</strong>.
        </p>
        <p class="prose">
          The headline metric is <em>dwell time</em> — the time from
          initial compromise to detection. Mandiant's M-Trends has
          tracked global medians dropping from ~400 days a decade ago to
          under two weeks today; SOCs are a big reason why.
        </p>

        <h3 class="subhead">Operating models</h3>
        <div class="prop-grid">
          <article class="prop">
            <h3>Internal SOC</h3>
            <p>
              Owned and staffed in-house. Maximum context, slowest to
              build. Common at large enterprises, banks, and regulated
              sectors where data sovereignty matters.
            </p>
          </article>
          <article class="prop">
            <h3>MSSP</h3>
            <p>
              Managed Security Service Provider. Outsourced 24/7
              monitoring of customer telemetry. Cheap to start, but
              context-poor — the provider doesn't know your applications
              the way your own engineers do.
            </p>
          </article>
          <article class="prop">
            <h3>MDR</h3>
            <p>
              Managed Detection &amp; Response. Like an MSSP but
              opinionated — they bring the EDR, the detection content,
              and authority to act (isolate hosts, kill processes). The
              fastest path to mature detection for mid-sized orgs.
            </p>
          </article>
          <article class="prop">
            <h3>Hybrid / Co-managed</h3>
            <p>
              Internal team handles tier 2/3 and incident response;
              MSSP/MDR handles tier 1 monitoring. Common when 24/7
              coverage is needed but the org isn't big enough for three
              shifts of analysts.
            </p>
          </article>
        </div>
      </section>

      <!-- People -->
      <section class="section">
        <h2>People — the analyst tiers</h2>
        <p class="prose">
          Most SOCs organise their staff into a tiered escalation model.
          The boundaries blur in practice — small teams collapse the
          tiers, mature teams dissolve them in favour of specialisation —
          but the framework is the lingua franca of SOC job descriptions.
        </p>

        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Role</th>
                <th>Primary focus</th>
                <th>Typical work</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Tier 1</strong> — Triage analyst</td>
                <td>Volume — clearing the alert queue</td>
                <td>Initial triage, false-positive tuning, escalation,
                  routine playbook execution.</td>
                <td>Log reading, basic OS internals, ticketing
                  discipline, attention to detail.</td>
              </tr>
              <tr>
                <td><strong>Tier 2</strong> — Investigator</td>
                <td>Depth — the alerts T1 can't resolve</td>
                <td>Pivoting across data sources, scoping the blast
                  radius, kicking off containment.</td>
                <td>Endpoint forensics, network analysis, SIEM query
                  fluency, scripting.</td>
              </tr>
              <tr>
                <td><strong>Tier 3</strong> — IR / Threat hunter</td>
                <td>Hard cases and proactive hunts</td>
                <td>Major incident lead, malware analysis, hypothesis-
                  driven hunts against ATT&amp;CK techniques.</td>
                <td>Reverse engineering, memory forensics, advanced
                  scripting, deep platform knowledge.</td>
              </tr>
              <tr>
                <td><strong>Detection engineer</strong></td>
                <td>The detection content itself</td>
                <td>Writes Sigma / SPL / KQL rules, tunes them, writes
                  unit tests, maintains the ATT&amp;CK coverage map.</td>
                <td>Software engineering + adversary tradecraft. The
                  highest-leverage role on the team.</td>
              </tr>
              <tr>
                <td><strong>SOC manager</strong></td>
                <td>People, metrics, stakeholders</td>
                <td>Shift scheduling, MTTD/MTTR reporting, executive
                  briefings, hiring, runbook ownership.</td>
                <td>Leadership, comms, enough technical depth to call
                  BS on vendors.</td>
              </tr>
              <tr>
                <td><strong>Threat intel analyst</strong></td>
                <td>Context — the "why" behind alerts</td>
                <td>Tracks threat actors, ingests IOCs, briefs the
                  team on emerging campaigns and TTPs.</td>
                <td>OSINT, language skills, dark-web research,
                  STIX/TAXII familiarity.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="subhead">Coverage models</h3>
        <ul class="bulletlist">
          <li>
            <strong>8×5</strong> — business-hours only. Cheapest. Fine
            for low-risk orgs that accept overnight detection lag.
          </li>
          <li>
            <strong>Follow-the-sun</strong> — three regional SOCs (e.g.
            EMEA, Americas, APAC) hand off at end of shift. No night
            shifts, full coverage. Requires three teams.
          </li>
          <li>
            <strong>24×7 with shifts</strong> — single SOC with rotating
            shifts. Burnout-prone; needs deliberate fatigue management
            and shift-handover ritual.
          </li>
          <li>
            <strong>Hybrid</strong> — internal team 8×5, MSSP/MDR fills
            after-hours. Most common pattern for mid-market enterprises.
          </li>
        </ul>
      </section>

      <!-- Process: Alert triage -->
      <section class="section">
        <h2>Process — alert triage</h2>
        <p class="prose">
          Triage is the SOC's main loop: take an alert off the queue,
          decide what it is, decide what to do about it, and write down
          why. The discipline of the loop matters more than its
          cleverness — alerts that aren't worked consistently are alerts
          that get missed.
        </p>

        <h3 class="subhead">The five questions of triage</h3>
        <ol class="bulletlist bulletlist--ordered">
          <li>
            <strong>What fired and why?</strong> Read the rule. What
            condition triggered it? Was it a known-good behaviour
            misclassified, or genuinely suspicious?
          </li>
          <li>
            <strong>Who and where?</strong> Identify the user, host, IP,
            process, and time window. Resolve usernames to people, IPs
            to assets, processes to parents.
          </li>
          <li>
            <strong>Is it real?</strong> Cross-check with other
            telemetry. The same activity should appear in multiple data
            sources — EDR, network, identity. If only one source sees
            it, suspect tuning issues.
          </li>
          <li>
            <strong>What's the blast radius?</strong> If real, what else
            did this account / host / process touch? Lateral movement?
            Data access? Persistence?
          </li>
          <li>
            <strong>What now?</strong> Close as FP, escalate to T2,
            kick off IR, or run a containment playbook (isolate host,
            disable account, block hash). Document the call.
          </li>
        </ol>

        <h3 class="subhead">Outcomes for a tier-1 alert</h3>
        <div class="prop-grid">
          <article class="prop">
            <h3>True Positive</h3>
            <p>
              Alert reflects real malicious or suspicious activity.
              Escalate per playbook; preserve evidence; notify the
              incident channel.
            </p>
          </article>
          <article class="prop">
            <h3>Benign True Positive</h3>
            <p>
              The detection logic was correct, but the activity is
              authorised (admin tools, pen-test, IT scan, sanctioned
              red-team exercise). Suppress with scope; don't blanket-
              tune.
            </p>
          </article>
          <article class="prop">
            <h3>False Positive</h3>
            <p>
              Detection logic is wrong — fires on benign activity that
              looks like an attack. Open a tuning ticket against the
              rule; don't just close-and-move-on or you'll see it again.
            </p>
          </article>
          <article class="prop">
            <h3>Inconclusive</h3>
            <p>
              Not enough data to decide. Escalate to T2 with what you've
              gathered; flag the data gap so detection engineering can
              fix the visibility problem.
            </p>
          </article>
        </div>

        <h3 class="subhead">Key metrics</h3>
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Definition</th>
                <th>Why it matters</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>MTTD</strong></td>
                <td>Mean Time to Detect — compromise to alert</td>
                <td>Function of detection coverage and telemetry
                  quality.</td>
              </tr>
              <tr>
                <td><strong>MTTA</strong></td>
                <td>Mean Time to Acknowledge — alert to analyst pickup</td>
                <td>Function of staffing and queue triage discipline.</td>
              </tr>
              <tr>
                <td><strong>MTTR</strong></td>
                <td>Mean Time to Respond / Resolve — alert to closure</td>
                <td>Function of automation, runbook quality, and analyst
                  skill.</td>
              </tr>
              <tr>
                <td><strong>Dwell time</strong></td>
                <td>Initial compromise to eviction</td>
                <td>The headline number — what every other metric feeds
                  into.</td>
              </tr>
              <tr>
                <td><strong>FP rate</strong></td>
                <td>% of alerts closed as false positive</td>
                <td>High FPs cause alert fatigue. &gt; 80% FP on a rule
                  is a tuning emergency.</td>
              </tr>
              <tr>
                <td><strong>ATT&amp;CK coverage</strong></td>
                <td>% of relevant techniques with detection content</td>
                <td>Maps detection investments to adversary behaviour
                  rather than vendor checkboxes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="subhead">The IR lifecycle (NIST SP 800-61)</h3>
        <p class="prose">
          When triage escalates to a real incident, the SOC switches
          into NIST's four-phase model — the playbook every IR programme
          ends up shaped around.
        </p>
        <ol class="bulletlist bulletlist--ordered">
          <li>
            <strong>Preparation</strong> — runbooks, tooling, comms
            channels, retainer contracts. Done <em>before</em> the
            incident.
          </li>
          <li>
            <strong>Detection &amp; Analysis</strong> — confirm the
            incident, scope it, classify it.
          </li>
          <li>
            <strong>Containment, Eradication &amp; Recovery</strong> —
            stop the bleeding, evict the attacker, restore service.
          </li>
          <li>
            <strong>Post-Incident Activity</strong> — lessons learned,
            detection gaps, runbook updates. The bit most teams skip.
          </li>
        </ol>
      </section>

      <!-- Technology -->
      <section class="section">
        <h2>Technology — the SOC tech stack</h2>
        <p class="prose">
          A modern SOC's tooling clusters into a few families. The names
          shift, vendors merge, but the functions persist.
        </p>

        <h3 class="subhead">Detection &amp; data platforms</h3>
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Category</th>
                <th>What it does</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>SIEM</strong></td>
                <td>Centralised log collection, correlation, and
                  alerting. The SOC's primary console.</td>
                <td>Splunk, Microsoft Sentinel, Elastic Security,
                  Sumo Logic, IBM QRadar, Chronicle.</td>
              </tr>
              <tr>
                <td><strong>EDR</strong></td>
                <td>Endpoint Detection &amp; Response — process,
                  file, registry, and network telemetry per host, plus
                  remote response actions (isolate, kill, run script).</td>
                <td>CrowdStrike Falcon, SentinelOne, Microsoft Defender
                  for Endpoint, Palo Alto Cortex XDR.</td>
              </tr>
              <tr>
                <td><strong>NDR</strong></td>
                <td>Network Detection &amp; Response — flow + payload
                  analysis at network choke points. Sees what endpoints
                  miss.</td>
                <td>Darktrace, ExtraHop, Corelight (Zeek), Vectra.</td>
              </tr>
              <tr>
                <td><strong>XDR</strong></td>
                <td>Extended D&amp;R — vendor-coined umbrella for
                  EDR + NDR + identity + cloud, single console. In
                  practice, vendor-locked SIEM-lite.</td>
                <td>Same vendors as EDR, with their broader portfolios.</td>
              </tr>
              <tr>
                <td><strong>Data lake</strong></td>
                <td>Cheap long-term log storage for hunting and
                  compliance. Decouples retention cost from SIEM
                  licensing.</td>
                <td>Snowflake, Databricks, AWS S3 + Athena, Cribl
                  Search.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="subhead">Workflow &amp; orchestration</h3>
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Category</th>
                <th>What it does</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>SOAR</strong></td>
                <td>Security Orchestration, Automation &amp; Response
                  — codifies playbooks as runnable workflows
                  (enrich, decide, act).</td>
                <td>Splunk SOAR (Phantom), Tines, Torq, Palo Alto XSOAR
                  (Demisto), Microsoft Sentinel Playbooks.</td>
              </tr>
              <tr>
                <td><strong>Case management / ticketing</strong></td>
                <td>The system of record for investigations — one
                  ticket per incident, evidence attached, timeline
                  preserved.</td>
                <td>TheHive, ServiceNow SecOps, Jira Service
                  Management, Swimlane.</td>
              </tr>
              <tr>
                <td><strong>Threat intel platform (TIP)</strong></td>
                <td>Aggregates IOC feeds, dedupes, scores, pushes to
                  detection tools. The connective tissue between intel
                  and operations.</td>
                <td>MISP, OpenCTI, Anomali ThreatStream,
                  ThreatConnect.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="subhead">Investigation &amp; analysis</h3>
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Category</th>
                <th>What it does</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sandbox</strong></td>
                <td>Detonates suspect files in an instrumented VM,
                  reports observed behaviour and IOCs.</td>
                <td>Joe Sandbox, ANY.RUN, Hybrid Analysis, Cuckoo /
                  CAPE.</td>
              </tr>
              <tr>
                <td><strong>OSINT &amp; reputation</strong></td>
                <td>Quick context on hashes, IPs, domains, URLs.</td>
                <td>VirusTotal, AbuseIPDB, URLscan, Shodan, Censys.</td>
              </tr>
              <tr>
                <td><strong>PCAP &amp; forensics</strong></td>
                <td>Deep-dive packet and disk analysis for incident
                  work.</td>
                <td>Wireshark, Zeek, Volatility, Velociraptor,
                  KAPE / Eric Zimmerman tools.</td>
              </tr>
              <tr>
                <td><strong>Detection-as-code</strong></td>
                <td>Version-controlled detection content with tests,
                  CI, peer review — the engineering practice the role
                  demands.</td>
                <td>Sigma + pySigma, Panther, Splunk
                  detection-as-code, custom GitOps pipelines.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="subhead">The data sources that actually matter</h3>
        <p class="prose">
          A SOC is only as good as its visibility. The data sources
          below produce the alerts that catch most real intrusions —
          missing any of them leaves a class of attacks invisible.
        </p>
        <ul class="bulletlist">
          <li>
            <strong>Endpoint</strong> — EDR telemetry, Sysmon (Windows),
            auditd / eBPF (Linux). Process trees, command lines, child-
            process anomalies.
          </li>
          <li>
            <strong>Identity</strong> — Active Directory, Entra ID /
            Azure AD, Okta, Google Workspace logs. Sign-ins, MFA
            events, privileged-role changes.
          </li>
          <li>
            <strong>Network</strong> — firewall, proxy, DNS, NetFlow,
            Zeek. Egress destinations, DNS exfil, beaconing patterns.
          </li>
          <li>
            <strong>Cloud control plane</strong> — CloudTrail (AWS),
            Activity Log (Azure), Audit Logs (GCP). Who created what,
            when, from where.
          </li>
          <li>
            <strong>Email</strong> — gateway logs and message tracing.
            Phishing, BEC, malicious attachments — still the #1 initial
            access vector.
          </li>
          <li>
            <strong>Application</strong> — auth logs, admin actions,
            transaction logs from business-critical apps. Often the only
            data source that catches insider abuse.
          </li>
        </ul>
      </section>

      <!-- Pitfalls -->
      <section class="section">
        <h2>Common pitfalls</h2>
        <ul class="bulletlist bulletlist--warn">
          <li>
            <strong>Tooling without process.</strong> Buying a SIEM
            doesn't make a SOC. Without runbooks, ticket discipline, and
            a tuning loop, the queue just gets bigger.
          </li>
          <li>
            <strong>Alert fatigue.</strong> If analysts see &gt; 80% FPs
            on a rule, they will stop reading it. Tune ruthlessly or
            disable.
          </li>
          <li>
            <strong>Tier-1 burnout.</strong> Triage is repetitive work;
            no career path out of it kills the team. Build a deliberate
            T1→T2→detection-engineering pipeline.
          </li>
          <li>
            <strong>No detection-engineering function.</strong> Vendor-
            shipped rules are a starting line, not a finish line. The
            highest-leverage hire in a maturing SOC is someone who can
            write and test detections.
          </li>
          <li>
            <strong>Visibility gaps treated as detection problems.</strong>
            If you can't see process command lines on Linux, no rule will
            save you. Fix the telemetry first.
          </li>
          <li>
            <strong>Skipping the post-incident review.</strong> The
            cheapest detections come from your own incidents — if you
            don't write the lessons-learned, you pay the same cost twice.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.callout {
  background: var(--sf2);
  border: 1px solid var(--bd);
  border-left: 2px solid var(--accent);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 11.5px;
  color: var(--dm);
  margin-bottom: 24px;
}
.callout strong {
  color: var(--accent);
  font-family: var(--sans);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 4px;
}
.callout em {
  color: var(--tx);
  font-style: italic;
}

.section {
  margin-bottom: 32px;
}
.section h2 {
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
  margin: 0 0 12px;
}
.subhead {
  margin: 18px 0 8px;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.prose {
  color: var(--tx);
  font-size: 12.5px;
  line-height: 1.7;
  margin: 0 0 12px;
}
.prose code,
.bulletlist code {
  background: var(--bg);
  border: 1px solid var(--bd);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11.5px;
  color: #9cdcfe;
}
.prose strong,
.bulletlist strong {
  color: #fff;
}
.prose em {
  color: var(--accent);
  font-style: normal;
}

.prop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
.prop {
  background: var(--sf);
  border: 1px solid var(--bd);
  border-top: 2px solid var(--accent);
  border-radius: 10px;
  padding: 12px 14px;
}
.prop h3 {
  margin: 0 0 6px;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}
.prop p {
  margin: 0 0 6px;
  color: var(--tx);
  font-size: 11.5px;
  line-height: 1.6;
}
.prop p:last-child {
  margin-bottom: 0;
}
.prop code {
  background: var(--bg);
  border: 1px solid var(--bd);
  border-radius: 4px;
  padding: 0 5px;
  font-size: 11px;
  color: #9cdcfe;
}
.prop em {
  color: var(--accent);
  font-style: normal;
}
.prop strong {
  color: #fff;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--bd);
  border-radius: 8px;
  background: var(--sf);
  margin-bottom: 12px;
}
.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.tbl th,
.tbl td {
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid var(--bd);
  vertical-align: top;
  color: var(--tx);
}
.tbl thead th {
  background: var(--sf2);
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--dm);
}
.tbl tbody tr:last-child td {
  border-bottom: 0;
}
.tbl tbody tr:hover {
  background: var(--sf2);
}
.tbl code {
  background: var(--bg);
  border: 1px solid var(--bd);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
  color: #9cdcfe;
  white-space: nowrap;
}
.tbl strong {
  color: #fff;
}

.bulletlist {
  margin: 0 0 12px;
  padding: 12px 14px 12px 30px;
  background: var(--sf);
  border: 1px solid var(--bd);
  border-left: 2px solid var(--accent);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bulletlist li {
  font-size: 12px;
  color: var(--tx);
  line-height: 1.6;
}
.bulletlist--ordered {
  list-style: decimal;
}
.bulletlist--warn {
  border-left-color: #d14c4c;
}
</style>

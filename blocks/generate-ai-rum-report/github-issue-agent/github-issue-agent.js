/**
 * GitHub Issue Agent - AI-powered issue logging using Bedrock
 */

import { callBedrockAPI, getBedrockToken, hasBedrockToken } from '../api/bedrock-api.js';

const CSS = '/blocks/generate-ai-rum-report/github-issue-agent/github-issue-agent.css';
if (!document.querySelector(`link[href^="${CSS.split('?')[0]}"]`)) {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = CSS;
  document.head.appendChild(l);
}

const STORAGE = 'optel-github-issue-prefs';
const savePrefs = (p) => {
  try { localStorage.setItem(STORAGE, JSON.stringify(p)); } catch { /* */ }
};

const GH = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

const mkUrl = (o, r, t, b) => `https://github.com/${o}/${r}/issues/new?${new URLSearchParams({ title: t, body: b })}`;
const mkBody = (a, i, d, u) => `## Priority Action\n\n${a}\n\n**Expected Impact:** ${i || 'See report'}\n\n---\n*Report: ${d || 'N/A'} | ${u || 'N/A'}*`;

function parseAction(el) {
  const txt = el.textContent || '';
  if (!txt.trim().startsWith('•')) return null;
  const clean = (s) => s.replace(/<[^>]+>/g, '').trim();
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  return parts.length >= 2
    ? { action: clean(parts[0]).replace(/^•\s*/, ''), impact: clean(parts[1]).replace(/^Expected Impact:\s*/i, '') }
    : { action: txt.split(/Expected Impact:/i)[0].replace(/^•\s*/, '').trim(), impact: (txt.split(/Expected Impact:/i)[1] || '').trim() };
}

function collectActions(section) {
  const actions = [];
  let type = 'code';
  section.querySelectorAll('p').forEach((el, i) => {
    const t = (el.textContent || '').toLowerCase();
    if (/content\s*actions?/.test(t)) { type = 'content'; return; }
    if (/code\s*actions?/.test(t)) { type = 'code'; return; }
    const d = parseAction(el);
    if (d) actions.push({ id: i + 1, type, ...d });
  });
  return actions;
}

const SYSTEM = `You are a GitHub issue assistant. Help log priority actions as issues.
Tool: "create_issues" - call when you have owner, repo, and action IDs.
Flow: 1. Ask for owner/repo 2. Ask: ALL or SELECT? 3. If select, show numbered list 4. Call tool
After issues created, if remaining actions exist, ask "Log remaining issues?" If no, say goodbye.
Rules: Be concise. Use numbered lists (not tables). Parse input flexibly.`;

const TOOL = {
  name: 'create_issues',
  description: 'Generate GitHub issue links',
  input_schema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      action_ids: { type: 'array', items: { type: 'number' } },
    },
    required: ['owner', 'repo', 'action_ids'],
  },
};

class GitHubIssueAgent {
  constructor(actions, date, url) {
    Object.assign(this, {
      actions, date, url, msgs: [], inp: null, el: null, msgArea: null, logged: [], owner: '', repo: '',
    });
  }

  close = () => this.el.remove();

  showConfirm() {
    this.el = document.createElement('div');
    this.el.className = 'github-chat-overlay';
    this.el.innerHTML = `<div class="github-chat-modal github-confirm">
      <div class="github-chat-header">${GH}<span>Log Issues to GitHub</span><button class="github-chat-close">&times;</button></div>
      <div class="github-confirm-body"><p>Do you have a GitHub repository for this site where you want to log issues?</p>
        <div class="github-confirm-btns"><button class="github-btn-no">No</button><button class="github-btn-yes">Yes, continue</button></div>
      </div></div>`;

    this.el.querySelector('.github-chat-close').onclick = this.close;
    this.el.querySelector('.github-btn-no').onclick = this.close;
    this.el.querySelector('.github-btn-yes').onclick = () => this.showChat();
    document.body.appendChild(this.el);
  }

  showChat() {
    const modal = this.el.querySelector('.github-confirm');
    modal.classList.remove('github-confirm');
    modal.innerHTML = `<div class="github-chat-header">${GH}<span>GitHub Issue Agent</span><button class="github-chat-close">&times;</button></div>
      <div class="github-chat-messages"></div>
      <div class="github-chat-input-area"><input type="text" class="github-chat-input" placeholder="Type here..." autocomplete="off"><button class="github-chat-send">${GH}</button></div>
      <div class="github-chat-footer"><button class="github-exit-btn">Exit</button></div>`;

    this.msgArea = modal.querySelector('.github-chat-messages');
    this.inp = modal.querySelector('.github-chat-input');
    modal.querySelector('.github-chat-close').onclick = this.close;
    modal.querySelector('.github-exit-btn').onclick = this.close;

    const send = () => { const m = this.inp.value.trim(); if (m) { this.inp.value = ''; this.onUser(m); } };
    this.inp.addEventListener('keydown', (e) => e.key === 'Enter' && send());
    modal.querySelector('.github-chat-send').onclick = send;

    setTimeout(() => this.inp.focus(), 100);
    this.startChat();
  }

  addMsg(t, isUser = false) {
    const d = document.createElement('div');
    d.className = `github-chat-message ${isUser ? 'user' : 'agent'}`;
    d.innerHTML = isUser ? t : t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    this.msgArea.appendChild(d);
    d.scrollIntoView({ behavior: 'smooth' });
  }

  async callAI(userMsg = null) {
    if (userMsg) this.msgs.push({ role: 'user', content: userMsg });
    const token = getBedrockToken();
    if (!token) { this.addMsg('⚠️ Bedrock token not set.'); return; }

    const typing = document.createElement('div');
    typing.className = 'github-chat-message agent typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    this.msgArea.appendChild(typing);
    typing.scrollIntoView({ behavior: 'smooth' });

    try {
      const { content } = await callBedrockAPI({
        system: SYSTEM, messages: this.msgs, tools: [TOOL], max_tokens: 1024,
      }, token);
      typing.remove();
      this.msgs.push({ role: 'assistant', content });

      const tool = content.find((c) => c.type === 'tool_use');
      if (tool?.name === 'create_issues') { await this.createIssues(tool); return; }

      const txt = content.find((c) => c.type === 'text');
      if (txt) this.addMsg(txt.text);
    } catch (e) { typing.remove(); this.addMsg(`⚠️ ${e.message}`); }
    setTimeout(() => this.inp?.focus(), 50);
  }

  async createIssues(tool) {
    const { owner, repo, action_ids: ids } = tool.input;
    savePrefs({ owner, repo });
    this.owner = owner;
    this.repo = repo;

    const sel = this.actions.filter((a) => ids.includes(a.id) && !this.logged.includes(a.id));
    if (!sel.length) { this.addMsg('No valid actions.'); return; }

    this.addMsg(`✅ Opening ${sel.length} issue${sel.length > 1 ? 's' : ''}...`);
    sel.forEach((a, i) => setTimeout(() => {
      window.open(mkUrl(owner, repo, a.action, mkBody(a.action, a.impact, this.date, this.url)), '_blank');
    }, i * 500));

    this.logged.push(...sel.map((a) => a.id));
    const remaining = this.actions.filter((a) => !this.logged.includes(a.id));

    // Send tool result to AI
    const result = remaining.length
      ? `Created ${sel.length} issues. Remaining: ${remaining.map((a) => `${a.id}. ${a.action}`).join(', ')}. Ask if user wants to log these.`
      : `Created ${sel.length} issues. All done!`;

    this.msgs.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: tool.id, content: result }] });
    await this.callAI();
  }

  async onUser(m) { this.addMsg(m, true); await this.callAI(m); }

  async startChat() {
    if (!hasBedrockToken()) { this.addMsg('⚠️ Bedrock token not set.'); return; }
    const list = this.actions.map((a) => `${a.id}. [${a.type}] ${a.action}`).join('\n');
    this.msgs.push({ role: 'user', content: `Log priority actions to GitHub.\n\n**Actions:**\n${list}\n\nAsk for owner/repo, then all or select.` });
    await this.callAI();
  }

  start() { this.showConfirm(); }
}

export function addLogIssuesButton(container, date, url) {
  const sec = [...container.querySelectorAll('.report-section, fieldset')]
    .find((s) => s.querySelector('legend, h4')?.textContent?.toLowerCase().includes('priority actions'));
  if (!sec || sec.querySelector('.github-log-legend')) return false;

  const acts = collectActions(sec);
  if (!acts.length) return false;

  const btn = document.createElement('legend');
  btn.className = 'github-log-legend';
  btn.innerHTML = `${GH}Log Issues`;
  btn.onclick = () => new GitHubIssueAgent(acts, date, url).start();

  sec.style.position = 'relative';
  const leg = sec.querySelector('legend');
  if (leg) leg.after(btn); else sec.insertBefore(btn, sec.firstChild);
  return true;
}

export function getReportMetadata() {
  const p = new URLSearchParams(window.location.search);
  const m = document.querySelector('meta[name="report-analyzed-url"]');
  return { reportDate: p.get('report') || new Date().toISOString().split('T')[0], analyzedUrl: m?.content || p.get('url') || window.location.origin };
}

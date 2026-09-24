/* eslint-disable no-unused-expressions */
/* global describe it */

import { expect } from '@esm-bundle/chai';
import {
  parseChapters,
  formatChapters,
  timeToSeconds,
  secondsToTime,
  getVideoId,
  applyChapters,
  ensureColumns,
} from '../../tools/youtube-chapters/sync-chapters.js';

// Verbatim from https://www.youtube.com/watch?v=-kj5zxgGHJk
const REAL_DESCRIPTION = `Join us this week to learn how Shred-it recently went live on AEM Document Author. We have Eric Van Geem and Sean McAuliffe from our partner Huge and Chris Millar from Adobe to share with us how they made it happen

Hosted by Lars Trieloff and Dominik Steinacher. Join us on YouTube to ask your questions live in chat.

Topics
00:00 Introduction
02:39 Start Presentation
49:24 Q&A
57:29 Upcoming Sessions`;

describe('YouTube chapter parsing', () => {
  it('reads the chapter list out of a real description', () => {
    expect(parseChapters(REAL_DESCRIPTION)).to.deep.equal([
      { seconds: 0, title: 'Introduction' },
      { seconds: 159, title: 'Start Presentation' },
      { seconds: 2964, title: 'Q&A' },
      { seconds: 3449, title: 'Upcoming Sessions' },
    ]);
  });

  it('round-trips through the sheet format the feed block reads', () => {
    expect(formatChapters(parseChapters(REAL_DESCRIPTION))).to.equal(
      '0:00 Introduction\n2:39 Start Presentation\n49:24 Q&A\n57:29 Upcoming Sessions',
    );
  });

  it('accepts hours, brackets, separators and trailing timestamps', () => {
    expect(parseChapters('[0:00] - Intro\n(1:30:05) Middle\nThe end 2:00:00')).to.deep.equal([
      { seconds: 0, title: 'Intro' },
      { seconds: 5405, title: 'Middle' },
      { seconds: 7200, title: 'The end' },
    ]);
  });

  it('ignores descriptions with no chapter list', () => {
    expect(parseChapters('')).to.deep.equal([]);
    expect(parseChapters(undefined)).to.deep.equal([]);
    expect(parseChapters('Live July 9th at 8:00 PDT. Bring your questions.')).to.deep.equal([]);
  });

  it('rejects a run of times that does not open the video', () => {
    expect(parseChapters('12:00 Lunch\n13:00 Talk\n14:00 Wrap up')).to.deep.equal([]);
  });

  it('rejects a list that is too short to be chapters', () => {
    expect(parseChapters('0:00 Intro\n5:00 Outro')).to.deep.equal([]);
  });

  it('stops at times that run backwards', () => {
    // The 1:02:00 runtime line must not extend the list.
    expect(parseChapters('0:00 Intro\n10:00 Demo\n40:00 Q&A\n1:00 total runtime')).to.deep.equal([
      { seconds: 0, title: 'Intro' },
      { seconds: 600, title: 'Demo' },
      { seconds: 2400, title: 'Q&A' },
    ]);
  });

  it('converts between timestamps and seconds', () => {
    expect(timeToSeconds('1:23')).to.equal(83);
    expect(timeToSeconds('1:23:45')).to.equal(5025);
    expect(secondsToTime(83)).to.equal('1:23');
    expect(secondsToTime(5025)).to.equal('1:23:45');
    expect(secondsToTime(0)).to.equal('0:00');
  });

  it('pulls the video id out of watch and short URLs', () => {
    expect(getVideoId('https://www.youtube.com/watch?v=A90U6LaYYwk')).to.equal('A90U6LaYYwk');
    expect(getVideoId('https://youtu.be/A90U6LaYYwk')).to.equal('A90U6LaYYwk');
    expect(getVideoId('not a url')).to.equal(null);
  });
});

const WITH_TOPICS = 'Blurb.\n\nTopics\n0:00 Intro\n2:00 Demo\n40:00 Q&A';
const NO_TOPICS = 'Just a blurb about the session, no chapter list at all.';

function row(extra) {
  return { URL: 'https://www.youtube.com/watch?v=abc123', Title: 'A session', ...extra };
}

describe('Chapter provenance', () => {
  it('writes chapters and marks them as coming from YouTube', () => {
    const rows = [row()];
    ensureColumns(rows);
    const changed = applyChapters(rows, new Map([['abc123', WITH_TOPICS]]));
    expect(changed).to.have.lengthOf(1);
    expect(rows[0].Chapters).to.equal('0:00 Intro\n2:00 Demo\n40:00 Q&A');
    expect(rows[0].ChaptersSource).to.equal('youtube');
  });

  it('does not wipe generated chapters when the description has none', () => {
    const rows = [row({ Chapters: '0:00 Welcome\n5:00 Demo\n9:00 Wrap-up', ChaptersSource: 'generated' })];
    const changed = applyChapters(rows, new Map([['abc123', NO_TOPICS]]));
    expect(changed).to.be.empty;
    expect(rows[0].Chapters).to.equal('0:00 Welcome\n5:00 Demo\n9:00 Wrap-up');
    expect(rows[0].ChaptersSource).to.equal('generated');
  });

  it('does not wipe hand-authored chapters either', () => {
    const rows = [row({ Chapters: '0:00 Start\n1:00 End', ChaptersSource: 'manual' })];
    applyChapters(rows, new Map([['abc123', NO_TOPICS]]));
    expect(rows[0].Chapters).to.equal('0:00 Start\n1:00 End');
  });

  it("lets the author's own Topics block replace generated chapters", () => {
    const rows = [row({ Chapters: '0:00 Guessed\n5:00 Also guessed\n9:00 Third', ChaptersSource: 'generated' })];
    applyChapters(rows, new Map([['abc123', WITH_TOPICS]]));
    expect(rows[0].Chapters).to.equal('0:00 Intro\n2:00 Demo\n40:00 Q&A');
    expect(rows[0].ChaptersSource).to.equal('youtube');
  });

  it('clears chapters it owns once the author removes the Topics block', () => {
    const rows = [row({ Chapters: '0:00 Intro\n2:00 Demo\n40:00 Q&A', ChaptersSource: 'youtube' })];
    const changed = applyChapters(rows, new Map([['abc123', NO_TOPICS]]));
    expect(changed).to.have.lengthOf(1);
    expect(rows[0].Chapters).to.equal('');
    expect(rows[0].ChaptersSource).to.equal('');
  });

  it('leaves rows alone when YouTube did not answer for the video', () => {
    const rows = [row({ Chapters: '0:00 Kept\n5:00 Still here\n9:00 Third', ChaptersSource: 'generated' })];
    const changed = applyChapters(rows, new Map());
    expect(changed).to.be.empty;
    expect(rows[0].Chapters).to.equal('0:00 Kept\n5:00 Still here\n9:00 Third');
  });

  it('gives every row both columns so the sheet stays rectangular', () => {
    const rows = [row(), row({ Chapters: '0:00 A' })];
    ensureColumns(rows);
    rows.forEach((r) => {
      expect(r).to.have.property('Chapters');
      expect(r).to.have.property('ChaptersSource');
    });
  });
});

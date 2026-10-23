import { useMemo, useState } from 'react';
import { isBackendConfigured, supabase } from './lib/supabase.js';

const contestants = [
  { id:'sample-1', number:'001', name:'Amara Grace', category:'Vocalist', bio:'A voice of worship, sharing a message of hope through song.', initials:'A' },
  { id:'sample-2', number:'002', name:'Jay Psalm', category:'Gospel rap', bio:'Rhythm, testimony and bold faith brought together on one stage.', initials:'J' },
  { id:'sample-3', number:'003', name:'Micah Keys', category:'Instrumentalist', bio:'Creating an atmosphere of praise through melody and musicianship.', initials:'M' },
  { id:'sample-4', number:'004', name:'Esther Verse', category:'Spoken word', bio:'Words shaped to encourage hearts and point people back to God.', initials:'E' },
  { id:'sample-5', number:'005', name:'Kingdom Motion', category:'Dance & drama', bio:'Movement and expression that turn every performance into praise.', initials:'K' },
  { id:'sample-6', number:'006', name:"David's Sound", category:'Vocal group', bio:'Harmony and heartfelt worship from a team united by purpose.', initials:'D' },
];
const prizes = [['Winner','₦300,000'],['1st Runner-up','₦200,000'],['2nd Runner-up','₦100,000'],['3rd Runner-up','₦50,000'],['4th Runner-up','₦30,000']];
const categories = ['Vocalist / Singer','Gospel rapper','Afro-gospel artist','Instrumentalist','Spoken-word artist','Gospel dance group','Gospel drama / theatre','Choir / vocal group','Other gospel talent'];

export default function App() {
  const [filter,setFilter] = useState('All');
  const [modal,setModal] = useState('');
  const [entry,setEntry] = useState('Individual');
  const [form,setForm] = useState({name:'',email:'',phone:'',category:categories[0],notes:''});
  const [message,setMessage] = useState('');
  const [voter,setVoter] = useState('');
  const [loading,setLoading] = useState(false);
  const [registrationReference,setRegistrationReference] = useState('');
  const shown = useMemo(()=>filter==='All'?contestants:contestants.filter(c=>c.category===filter),[filter]);
  const fee = entry==='Group'?'₦10,000':'₦3,000';

  async function submitRegistration(e) {
    e.preventDefault();
    setMessage('');
    setRegistrationReference('');
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/create-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryType: entry, ...form })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not submit your registration. Please try again.');
      setRegistrationReference(result.reference);
      setMessage('Registration saved. Your status is PENDING PAYMENT. Transfer the fee to the bank account shown below, then send your receipt and reference to the organizers on WhatsApp. Your payment will remain unconfirmed until the organizer checks it.');
    } catch (err) {
      setMessage(err?.message || 'We could not submit the registration. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function requestVote(e) {
    e.preventDefault();
    if (!isBackendConfigured) { setMessage('Secure voting is not connected yet. No vote has been cast.'); return; }
    setMessage('Voter verification must be enabled by the event team before votes can be accepted. No vote has been cast.');
  }

  return <main>
    <div className="topline">Season 3 · A celebration of gospel talent · Voting is free</div>
    <header className="wrap nav"><a className="brand" href="#home" aria-label="El-Roi home"><span className="logo-mark">E<span>R</span></span><span><b>EL-ROI</b><small>GOSPEL TALENT HUNT</small></span></a><nav><a href="#contestants">Contestants</a><a href="#leaderboard">Leaderboard</a><a href="#how">How to vote</a><a href="#prizes">Prizes</a></nav><button className="btn" onClick={()=>{setModal('register');setMessage('')}}>Register talent</button></header>
    <section className="hero" id="home"><div className="wrap hero-grid"><div><div className="eyebrow">The stage is calling · Season 03</div><h1>Let your gift<br/>make room.<br/><em>Give God glory.</em></h1><p>One stage. Many gifts. One purpose. Discover extraordinary gospel talents and celebrate the voices, creativity and gifts lifting up His name.</p><div className="actions"><a className="btn" href="#contestants">Meet the contestants ↗</a><a className="btn ghost" href="#how">How free voting works</a></div><div className="hero-note">— “Let everything that has breath praise the Lord.” · Psalm 150:6</div></div><div className="event-art"><div className="art-ring"><div><span>GOSPEL TALENT HUNT</span><strong>3.0</strong><small>EL-ROI · SEASON THREE</small></div></div></div></div></section>
    <div className="statband"><div className="wrap stats"><div><strong>₦300,000</strong><span>Winner's prize</span></div><div><strong>09+</strong><span>Talent expressions</span></div><div><strong>Free</strong><span>Public voting</span></div><div><strong>1 person</strong><span>One vote each</span></div></div></div>
    {!isBackendConfigured && <div className="backend-note wrap"><span className="status-dot"/> Preview mode — contestant examples are placeholders; live registration and verified voting will be enabled after backend setup.</div>}
    <section className="section wrap" id="contestants"><div className="section-head"><div><div className="eyebrow">The people behind the gifts</div><h2>Meet the contestants</h2></div><p>Discover their gifts and support the talent that speaks to you. Sample profiles will be replaced by approved contestants.</p></div><div className="filters">{['All',...new Set(contestants.map(c=>c.category))].map(x=><button key={x} className={filter===x?'filter active':'filter'} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="contestants">{shown.map(c=><article className="contestant" key={c.id}><div className="poster"><span className="rank">CONTESTANT {c.number}</span><span className="avatar">{c.initials}</span></div><div className="contestant-body"><span className="category">{c.category} · Sample</span><h3>{c.name}</h3><p>{c.bio}</p><div className="card-actions"><button className="btn dark" onClick={()=>{setModal('profile');setMessage(c.name)}}>View profile</button><button className="btn" onClick={()=>{setModal('vote');setMessage(c.name)}}>Vote free</button></div></div></article>)}</div></section>
    <section className="section compact"><div className="wrap vote-callout"><div><div className="eyebrow">No payment · No vote packages</div><h2>Your vote is a show of support.</h2><p>Voting is free and limited to one vote per verified person. The live system must verify identity and enforce vote limits securely.</p></div><button className="btn" onClick={()=>{setModal('vote');setMessage('your favourite contestant')}}>Start voting ↗</button></div></section>
    <section className="section shaded" id="leaderboard"><div className="wrap lower"><div className="panel"><div className="eyebrow">The current picture</div><h2>Leaderboard</h2><p className="muted">Live rankings appear once the verified voting system is enabled.</p>{contestants.slice(0,5).map((c,i)=><div className="leader-row" key={c.id}><span className="num">{String(i+1).padStart(2,'0')}</span><div><b>{c.name}</b><small>{c.category} · {c.number}</small></div><span className="votes">— votes</span></div>)}</div><div className="panel" id="how"><div className="eyebrow">Simple. Free. Fair.</div><h2>How voting works</h2><div className="steps">{[['1','Explore contestants','Read profiles and choose the talent you want to support.'],['2','Verify your identity','Use the secure one-time verification method provided by the organizers.'],['3','Cast one free vote','No payment is required. One vote per person.'],['4','Share the profile','Invite others to discover the talent and participate fairly.']].map(s=><div className="step" key={s[0]}><b>{s[0]}</b><div><strong>{s[1]}</strong><p>{s[2]}</p></div></div>)}</div></div></div></section>
    <section className="section wrap" id="prizes"><div className="section-head"><div><div className="eyebrow">Celebrating excellence</div><h2>The prizes</h2></div><p>Recognising the dedication, creativity and gift each contestant brings to the stage.</p></div><div className="prizes">{prizes.map(([place,amount])=><div className="prize" key={place}><small>{place}</small><strong>{amount}</strong></div>)}</div></section>
    <section className="register"><div className="wrap register-inner"><div><div className="eyebrow">Your gift belongs on the stage</div><h2>Ready to share your talent?</h2><p>Registration fees are separate from free public voting. Individual entries are ₦3,000 and group entries are ₦10,000.</p><p className="venue">Venue: Divine Suites, before Dantata Street, behind Presbyterian Church, Checkpoint, Nasarawa State · Event date: Coming Soon</p></div><button className="btn" onClick={()=>{setModal('register');setMessage('')}}>Register now ↗</button></div></section>
    <footer><div className="wrap footrow"><a className="brand" href="#home"><span className="logo-mark">E<span>R</span></span><span><b>EL-ROI</b><small>GOSPEL TALENT HUNT</small></span></a><div className="socials"><span>Facebook · El Rois Talent Hunt</span><span>TikTok · @elroitalenthunt</span><span>Instagram · elroisgospeltalenthunt</span><span>YouTube · elroistalenthunt</span></div></div><div className="wrap copyright">© El-Roi Gospel Talent Hunt · Season 3 <span>Divine Suites, Checkpoint, Nasarawa State</span></div></footer>
    {modal && <div className="modal" onMouseDown={e=>{if(e.target===e.currentTarget){setModal('');setMessage('')}}}><div className="dialog"><button className="close" onClick={()=>{setModal('');setMessage('')}} aria-label="Close">×</button>
      {modal==='register' && <><div className="eyebrow">Season 3 registration</div><h2>Register your talent</h2><p>Complete your details. Payment will be reviewed manually by the event team.</p><form onSubmit={submitRegistration}><label>Entry type<select value={entry} onChange={e=>setEntry(e.target.value)}><option>Individual</option><option>Group</option></select></label><div className="fee-box"><small>REGISTRATION FEE</small><strong>{fee}</strong></div><label>Your name / group name<input required maxLength="120" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Enter full name"/></label><label>Email address<input required type="email" maxLength="254" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Phone number<input required type="tel" maxLength="30" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Active phone number"/></label><label>Talent category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Additional details (optional)<textarea maxLength="1000" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Tell us briefly about your talent"/></label><button className="btn full" disabled={loading}>{loading?'Submitting…':'Continue to registration'}</button></form><div className="notice">Bank: Wema Bank · Account name: K-S ADEGBE NIG LTD · Account number: 0125731531. Do not send payment until you are ready to register. Receipt verification is manual.</div></>}
      {modal==='profile' && <><div className="eyebrow">Contestant profile · sample</div><h2>{message}</h2><p>This profile is sample content. Approved contestant biographies, photos, contestant numbers and verified vote totals will appear here after the organizer publishes them.</p></>}
      {modal==='vote' && <><div className="eyebrow">Free voting</div><h2>Support {message || 'your favourite contestant'}</h2><p>Voting is free. One vote per verified person. No vote has been cast from this preview.</p><form onSubmit={requestVote}><label>Email or mobile number<input required value={voter} onChange={e=>setVoter(e.target.value)} placeholder="Enter email or phone number"/></label><button className="btn full">Continue to verification</button></form></>}
      {message && modal==='register' && <p className="notice" role="status">{message}</p>}
      {registrationReference && modal==='register' && <div className="payment-next-step"><p><strong>Registration reference: {registrationReference}</strong></p><p>Bank: Wema Bank<br/>Account name: K-S ADEGBE NIG LTD<br/>Account number: 0125731531<br/>Fee: {fee}</p><a className="btn full" href={`https://wa.me/2347039558747?text=${encodeURIComponent(`Hello El-Roi Gospel Talent Hunt team. I have paid my registration fee. Reference: ${registrationReference}. Name: ${form.name}. Entry: ${entry}. Category: ${form.category}. Please confirm my payment.`)}`} target="_blank" rel="noreferrer">Send receipt on WhatsApp ↗</a></div>}
      {message && modal==='vote' && <p className="notice" role="status">{message}</p>}
    </div></div>}
  </main>;
}

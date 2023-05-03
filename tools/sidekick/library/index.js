function E(r,t,e){return(t=function(o){var a=function(s,c){if(typeof s!="object"||s===null)return s;var i=s[Symbol.toPrimitive];if(i!==void 0){var n=i.call(s,c||"default");if(typeof n!="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(c==="string"?String:Number)(s)}(o,"string");return typeof a=="symbol"?a:String(a)}(t))in r?Object.defineProperty(r,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):r[t]=e,r}const Et=window,Lt=Et.ShadowRoot&&(Et.ShadyCSS===void 0||Et.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ot=Symbol(),Ee=new WeakMap;class Le{constructor(t,e,o){if(this._$cssResult$=!0,o!==Ot)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(Lt&&t===void 0){const o=e!==void 0&&e.length===1;o&&(t=Ee.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&Ee.set(e,t))}return t}toString(){return this.cssText}}const p=(r,...t)=>{const e=r.length===1?r[0]:t.reduce((o,a,s)=>o+(c=>{if(c._$cssResult$===!0)return c.cssText;if(typeof c=="number")return c;throw Error("Value passed to 'css' function must be a 'css' function result: "+c+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+r[s+1],r[0]);return new Le(e,r,Ot)},Ae=Lt?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(const o of t.cssRules)e+=o.cssText;return(o=>new Le(typeof o=="string"?o:o+"",void 0,Ot))(e)})(r):r;var Ut;const At=window,Se=At.trustedTypes,Hr=Se?Se.emptyScript:"",Te=At.reactiveElementPolyfillSupport,Xt={toAttribute(r,t){switch(t){case Boolean:r=r?Hr:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch(o){e=null}}return e}},$e=(r,t)=>t!==r&&(t==t||r==r),Rt={attribute:!0,type:String,converter:Xt,reflect:!1,hasChanged:$e};class st extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(t){var e;this.finalize(),((e=this.h)!==null&&e!==void 0?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,o)=>{const a=this._$Ep(o,e);a!==void 0&&(this._$Ev.set(a,o),t.push(a))}),t}static createProperty(t,e=Rt){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const o=typeof t=="symbol"?Symbol():"__"+t,a=this.getPropertyDescriptor(t,o,e);a!==void 0&&Object.defineProperty(this.prototype,t,a)}}static getPropertyDescriptor(t,e,o){return{get(){return this[e]},set(a){const s=this[t];this[e]=a,this.requestUpdate(t,s,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||Rt}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),t.h!==void 0&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,o=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const a of o)this.createProperty(a,e[a])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const o=new Set(t.flat(1/0).reverse());for(const a of o)e.unshift(Ae(a))}else t!==void 0&&e.push(Ae(t));return e}static _$Ep(t,e){const o=e.attribute;return o===!1?void 0:typeof o=="string"?o:typeof t=="string"?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(t=this.constructor.h)===null||t===void 0||t.forEach(e=>e(this))}addController(t){var e,o;((e=this._$ES)!==null&&e!==void 0?e:this._$ES=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((o=t.hostConnected)===null||o===void 0||o.call(t))}removeController(t){var e;(e=this._$ES)===null||e===void 0||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return((o,a)=>{Lt?o.adoptedStyleSheets=a.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet):a.forEach(s=>{const c=document.createElement("style"),i=Et.litNonce;i!==void 0&&c.setAttribute("nonce",i),c.textContent=s.cssText,o.appendChild(c)})})(e,this.constructor.elementStyles),e}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$ES)===null||t===void 0||t.forEach(e=>{var o;return(o=e.hostConnected)===null||o===void 0?void 0:o.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$ES)===null||t===void 0||t.forEach(e=>{var o;return(o=e.hostDisconnected)===null||o===void 0?void 0:o.call(e)})}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$EO(t,e,o=Rt){var a;const s=this.constructor._$Ep(t,o);if(s!==void 0&&o.reflect===!0){const c=(((a=o.converter)===null||a===void 0?void 0:a.toAttribute)!==void 0?o.converter:Xt).toAttribute(e,o.type);this._$El=t,c==null?this.removeAttribute(s):this.setAttribute(s,c),this._$El=null}}_$AK(t,e){var o;const a=this.constructor,s=a._$Ev.get(t);if(s!==void 0&&this._$El!==s){const c=a.getPropertyOptions(s),i=typeof c.converter=="function"?{fromAttribute:c.converter}:((o=c.converter)===null||o===void 0?void 0:o.fromAttribute)!==void 0?c.converter:Xt;this._$El=s,this[s]=i.fromAttribute(e,c.type),this._$El=null}}requestUpdate(t,e,o){let a=!0;t!==void 0&&(((o=o||this.constructor.getPropertyOptions(t)).hasChanged||$e)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),o.reflect===!0&&this._$El!==t&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(t,o))):a=!1),!this.isUpdatePending&&a&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((a,s)=>this[s]=a),this._$Ei=void 0);let e=!1;const o=this._$AL;try{e=this.shouldUpdate(o),e?(this.willUpdate(o),(t=this._$ES)===null||t===void 0||t.forEach(a=>{var s;return(s=a.hostUpdate)===null||s===void 0?void 0:s.call(a)}),this.update(o)):this._$Ek()}catch(a){throw e=!1,this._$Ek(),a}e&&this._$AE(o)}willUpdate(t){}_$AE(t){var e;(e=this._$ES)===null||e===void 0||e.forEach(o=>{var a;return(a=o.hostUpdated)===null||a===void 0?void 0:a.call(o)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){this._$EC!==void 0&&(this._$EC.forEach((e,o)=>this._$EO(o,this[o],e)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}var Nt;st.finalized=!0,st.elementProperties=new Map,st.elementStyles=[],st.shadowRootOptions={mode:"open"},Te==null||Te({ReactiveElement:st}),((Ut=At.reactiveElementVersions)!==null&&Ut!==void 0?Ut:At.reactiveElementVersions=[]).push("1.6.1");const St=window,at=St.trustedTypes,_e=at?at.createPolicy("lit-html",{createHTML:r=>r}):void 0,Ft="$lit$",U=`lit$${(Math.random()+"").slice(9)}$`,He="?"+U,jr=`<${He}>`,ct=document,bt=()=>ct.createComment(""),ht=r=>r===null||typeof r!="object"&&typeof r!="function",je=Array.isArray,Gt=`[ 	
\f\r]`,vt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,qe=/-->/g,Me=/>/g,Y=RegExp(`>|${Gt}(?:([^\\s"'>=/]+)(${Gt}*=${Gt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Be=/'/g,De=/"/g,Pe=/^(?:script|style|textarea|title)$/i,Oe=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),u=Oe(1),qr=Oe(2),H=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),Ue=new WeakMap,it=ct.createTreeWalker(ct,129,null,!1);class Ct{constructor({strings:t,_$litType$:e},o){let a;this.parts=[];let s=0,c=0;const i=t.length-1,n=this.parts,[m,g]=((d,y)=>{const x=d.length-1,O=[];let A,rt=y===2?"<svg>":"",k=vt;for(let gt=0;gt<x;gt++){const ot=d[gt];let Ce,S,Q=-1,Pt=0;for(;Pt<ot.length&&(k.lastIndex=Pt,S=k.exec(ot),S!==null);)Pt=k.lastIndex,k===vt?S[1]==="!--"?k=qe:S[1]!==void 0?k=Me:S[2]!==void 0?(Pe.test(S[2])&&(A=RegExp("</"+S[2],"g")),k=Y):S[3]!==void 0&&(k=Y):k===Y?S[0]===">"?(k=A!=null?A:vt,Q=-1):S[1]===void 0?Q=-2:(Q=k.lastIndex-S[2].length,Ce=S[1],k=S[3]===void 0?Y:S[3]==='"'?De:Be):k===De||k===Be?k=Y:k===qe||k===Me?k=vt:(k=Y,A=void 0);const Ie=k===Y&&d[gt+1].startsWith("/>")?" ":"";rt+=k===vt?ot+jr:Q>=0?(O.push(Ce),ot.slice(0,Q)+Ft+ot.slice(Q)+U+Ie):ot+U+(Q===-2?(O.push(void 0),gt):Ie)}const ze=rt+(d[x]||"<?>")+(y===2?"</svg>":"");if(!Array.isArray(d)||!d.hasOwnProperty("raw"))throw Error("invalid template strings array");return[_e!==void 0?_e.createHTML(ze):ze,O]})(t,e);if(this.el=Ct.createElement(m,o),it.currentNode=this.el.content,e===2){const d=this.el.content,y=d.firstChild;y.remove(),d.append(...y.childNodes)}for(;(a=it.nextNode())!==null&&n.length<i;){if(a.nodeType===1){if(a.hasAttributes()){const d=[];for(const y of a.getAttributeNames())if(y.endsWith(Ft)||y.startsWith(U)){const x=g[c++];if(d.push(y),x!==void 0){const O=a.getAttribute(x.toLowerCase()+Ft).split(U),A=/([.?@])?(.*)/.exec(x);n.push({type:1,index:s,name:A[2],strings:O,ctor:A[1]==="."?Br:A[1]==="?"?Pr:A[1]==="@"?Or:Tt})}else n.push({type:6,index:s})}for(const y of d)a.removeAttribute(y)}if(Pe.test(a.tagName)){const d=a.textContent.split(U),y=d.length-1;if(y>0){a.textContent=at?at.emptyScript:"";for(let x=0;x<y;x++)a.append(d[x],bt()),it.nextNode(),n.push({type:2,index:++s});a.append(d[y],bt())}}}else if(a.nodeType===8)if(a.data===He)n.push({type:2,index:s});else{let d=-1;for(;(d=a.data.indexOf(U,d+1))!==-1;)n.push({type:7,index:s}),d+=U.length-1}s++}}static createElement(t,e){const o=ct.createElement("template");return o.innerHTML=t,o}}function nt(r,t,e=r,o){var a,s,c,i;if(t===H)return t;let n=o!==void 0?(a=e._$Co)===null||a===void 0?void 0:a[o]:e._$Cl;const m=ht(t)?void 0:t._$litDirective$;return(n==null?void 0:n.constructor)!==m&&((s=n==null?void 0:n._$AO)===null||s===void 0||s.call(n,!1),m===void 0?n=void 0:(n=new m(r),n._$AT(r,e,o)),o!==void 0?((c=(i=e)._$Co)!==null&&c!==void 0?c:i._$Co=[])[o]=n:e._$Cl=n),n!==void 0&&(t=nt(r,n._$AS(r,t.values),n,o)),t}class Mr{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:o},parts:a}=this._$AD,s=((e=t==null?void 0:t.creationScope)!==null&&e!==void 0?e:ct).importNode(o,!0);it.currentNode=s;let c=it.nextNode(),i=0,n=0,m=a[0];for(;m!==void 0;){if(i===m.index){let g;m.type===2?g=new It(c,c.nextSibling,this,t):m.type===1?g=new m.ctor(c,m.name,m.strings,this,t):m.type===6&&(g=new Ur(c,this,t)),this._$AV.push(g),m=a[++n]}i!==(m==null?void 0:m.index)&&(c=it.nextNode(),i++)}return s}v(t){let e=0;for(const o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}}class It{constructor(t,e,o,a){var s;this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=a,this._$Cp=(s=a==null?void 0:a.isConnected)===null||s===void 0||s}get _$AU(){var t,e;return(e=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&e!==void 0?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=nt(this,t,e),ht(t)?t===f||t==null||t===""?(this._$AH!==f&&this._$AR(),this._$AH=f):t!==this._$AH&&t!==H&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):(o=>je(o)||typeof(o==null?void 0:o[Symbol.iterator])=="function")(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==f&&ht(this._$AH)?this._$AA.nextSibling.data=t:this.$(ct.createTextNode(t)),this._$AH=t}g(t){var e;const{values:o,_$litType$:a}=t,s=typeof a=="number"?this._$AC(t):(a.el===void 0&&(a.el=Ct.createElement(a.h,this.options)),a);if(((e=this._$AH)===null||e===void 0?void 0:e._$AD)===s)this._$AH.v(o);else{const c=new Mr(s,this),i=c.u(this.options);c.v(o),this.$(i),this._$AH=c}}_$AC(t){let e=Ue.get(t.strings);return e===void 0&&Ue.set(t.strings,e=new Ct(t)),e}T(t){je(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let o,a=0;for(const s of t)a===e.length?e.push(o=new It(this.k(bt()),this.k(bt()),this,this.options)):o=e[a],o._$AI(s),a++;a<e.length&&(this._$AR(o&&o._$AB.nextSibling,a),e.length=a)}_$AR(t=this._$AA.nextSibling,e){var o;for((o=this._$AP)===null||o===void 0||o.call(this,!1,!0,e);t&&t!==this._$AB;){const a=t.nextSibling;t.remove(),t=a}}setConnected(t){var e;this._$AM===void 0&&(this._$Cp=t,(e=this._$AP)===null||e===void 0||e.call(this,t))}}class Tt{constructor(t,e,o,a,s){this.type=1,this._$AH=f,this._$AN=void 0,this.element=t,this.name=e,this._$AM=a,this.options=s,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=f}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,o,a){const s=this.strings;let c=!1;if(s===void 0)t=nt(this,t,e,0),c=!ht(t)||t!==this._$AH&&t!==H,c&&(this._$AH=t);else{const i=t;let n,m;for(t=s[0],n=0;n<s.length-1;n++)m=nt(this,i[o+n],e,n),m===H&&(m=this._$AH[n]),c||(c=!ht(m)||m!==this._$AH[n]),m===f?t=f:t!==f&&(t+=(m!=null?m:"")+s[n+1]),this._$AH[n]=m}c&&!a&&this.j(t)}j(t){t===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t!=null?t:"")}}class Br extends Tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===f?void 0:t}}const Dr=at?at.emptyScript:"";class Pr extends Tt{constructor(){super(...arguments),this.type=4}j(t){t&&t!==f?this.element.setAttribute(this.name,Dr):this.element.removeAttribute(this.name)}}class Or extends Tt{constructor(t,e,o,a,s){super(t,e,o,a,s),this.type=5}_$AI(t,e=this){var o;if((t=(o=nt(this,t,e,0))!==null&&o!==void 0?o:f)===H)return;const a=this._$AH,s=t===f&&a!==f||t.capture!==a.capture||t.once!==a.once||t.passive!==a.passive,c=t!==f&&(a===f||s);s&&this.element.removeEventListener(this.name,this,a),c&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,o;typeof this._$AH=="function"?this._$AH.call((o=(e=this.options)===null||e===void 0?void 0:e.host)!==null&&o!==void 0?o:this.element,t):this._$AH.handleEvent(t)}}class Ur{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){nt(this,t)}}const Xe=St.litHtmlPolyfillSupport;Xe==null||Xe(Ct,It),((Nt=St.litHtmlVersions)!==null&&Nt!==void 0?Nt:St.litHtmlVersions=[]).push("2.7.2");var Vt,Kt;class $ extends st{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const o=super.createRenderRoot();return(t=(e=this.renderOptions).renderBefore)!==null&&t!==void 0||(e.renderBefore=o.firstChild),o}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((o,a,s)=>{var c,i;const n=(c=s==null?void 0:s.renderBefore)!==null&&c!==void 0?c:a;let m=n._$litPart$;if(m===void 0){const g=(i=s==null?void 0:s.renderBefore)!==null&&i!==void 0?i:null;n._$litPart$=m=new It(a.insertBefore(bt(),g),g,void 0,s!=null?s:{})}return m._$AI(o),m})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)===null||t===void 0||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)===null||t===void 0||t.setConnected(!1)}render(){return H}}$.finalized=!0,$._$litElement$=!0,(Vt=globalThis.litElementHydrateSupport)===null||Vt===void 0||Vt.call(globalThis,{LitElement:$});const Re=globalThis.litElementPolyfillSupport;Re==null||Re({LitElement:$}),((Kt=globalThis.litElementVersions)!==null&&Kt!==void 0?Kt:globalThis.litElementVersions=[]).push("3.3.1");const Zt=new Set,Xr=new MutationObserver(()=>{const r=document.documentElement.dir==="rtl"?document.documentElement.dir:"ltr";Zt.forEach(t=>{t.setAttribute("dir",r)})});Xr.observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]});const Rr=r=>r.startManagingContentDirection!==void 0||r.tagName==="SP-THEME";class L extends function(t){return class extends t{get isLTR(){return this.dir==="ltr"}hasVisibleFocusInTree(){const e=this.getRootNode().activeElement;if(!e)return!1;try{return e.matches(":focus-visible")||e.matches(".focus-visible")}catch(o){return e.matches(".focus-visible")}}connectedCallback(){if(!this.hasAttribute("dir")){let e=this.assignedSlot||this.parentNode;for(;e!==document.documentElement&&!Rr(e);)e=e.assignedSlot||e.parentNode||e.host;if(this.dir=e.dir==="rtl"?e.dir:this.dir||"ltr",e===document.documentElement)Zt.add(this);else{const{localName:o}=e;o.search("-")>-1&&!customElements.get(o)?customElements.whenDefined(o).then(()=>{e.startManagingContentDirection(this)}):e.startManagingContentDirection(this)}this._dirParent=e}super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._dirParent&&(this._dirParent===document.documentElement?Zt.delete(this):this._dirParent.stopManagingContentDirection(this),this.removeAttribute("dir"))}}}($){}const Nr=(r,t)=>t.kind==="method"&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(e){e.createProperty(t.key,r)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){typeof t.initializer=="function"&&(this[t.key]=t.initializer.call(this))},finisher(e){e.createProperty(t.key,r)}};function l(r){return(t,e)=>e!==void 0?((o,a,s)=>{a.constructor.createProperty(s,o)})(r,t,e):Nr(r,t)}function Wt(r){return l({...r,state:!0})}const Qt=({finisher:r,descriptor:t})=>(e,o)=>{var a;if(o===void 0){const s=(a=e.originalKey)!==null&&a!==void 0?a:e.key,c=t!=null?{kind:"method",placement:"prototype",key:s,descriptor:t(e.key)}:{...e,key:s};return r!=null&&(c.finisher=function(i){r(i,s)}),c}{const s=e.constructor;t!==void 0&&Object.defineProperty(e,o,t(o)),r==null||r(s,o)}};function X(r,t){return Qt({descriptor:e=>{const o={get(){var a,s;return(s=(a=this.renderRoot)===null||a===void 0?void 0:a.querySelector(r))!==null&&s!==void 0?s:null},enumerable:!0,configurable:!0};if(t){const a=typeof e=="symbol"?Symbol():"__"+e;o.get=function(){var s,c;return this[a]===void 0&&(this[a]=(c=(s=this.renderRoot)===null||s===void 0?void 0:s.querySelector(r))!==null&&c!==void 0?c:null),this[a]}}return o}})}var Yt;const Fr=((Yt=window.HTMLSlotElement)===null||Yt===void 0?void 0:Yt.prototype.assignedElements)!=null?(r,t)=>r.assignedElements(t):(r,t)=>r.assignedNodes(t).filter(e=>e.nodeType===Node.ELEMENT_NODE);function Ne(r,t,e){let o,a=r;return typeof r=="object"?(a=r.slot,o=r):o={flatten:t},e?function(s){const{slot:c,selector:i}=s!=null?s:{};return Qt({descriptor:n=>({get(){var m;const g="slot"+(c?`[name=${c}]`:":not([name])"),d=(m=this.renderRoot)===null||m===void 0?void 0:m.querySelector(g),y=d!=null?Fr(d,s):[];return i?y.filter(x=>x.matches(i)):y},enumerable:!0,configurable:!0})})}({slot:a,flatten:t,selector:e}):Qt({descriptor:s=>({get(){var c,i;const n="slot"+(a?`[name=${a}]`:":not([name])"),m=(c=this.renderRoot)===null||c===void 0?void 0:c.querySelector(n);return(i=m==null?void 0:m.assignedNodes(o))!==null&&i!==void 0?i:[]},enumerable:!0,configurable:!0})})}var Gr=Object.defineProperty,Vr=Object.getOwnPropertyDescriptor;function R(r,{validSizes:t=["s","m","l","xl"],noDefaultSize:e,defaultSize:o="m"}={}){class a extends r{constructor(){super(...arguments),this._size=o}get size(){return this._size||o}set size(c){const i=e?null:o,n=c&&c.toLocaleLowerCase(),m=t.includes(n)?n:i;if(m&&this.setAttribute("size",m),this._size===m)return;const g=this._size;this._size=m,this.requestUpdate("size",g)}update(c){!this.hasAttribute("size")&&!e&&this.setAttribute("size",this.size),super.update(c)}}return((s,c,i,n)=>{for(var m,g=n>1?void 0:n?Vr(c,i):c,d=s.length-1;d>=0;d--)(m=s[d])&&(g=(n?m(c,i,g):m(g))||g);n&&g&&Gr(c,i,g)})([l({type:String,reflect:!0})],a.prototype,"size",1),a}const Kr=["spectrum","express"],Zr=["medium","large","medium-express","large-express"],Wr=["light","lightest","dark","darkest","light-express","lightest-express","dark-express","darkest-express"],C=class extends HTMLElement{constructor(){super(),this._dir="",this._theme="spectrum",this._color="",this._scale="",this.trackedChildren=new Set,this._updateRequested=!1,this._contextConsumers=new Map,this.attachShadow({mode:"open"});const r=document.importNode(C.template.content,!0);this.shadowRoot.appendChild(r),this.shouldAdoptStyles(),this.addEventListener("sp-query-theme",this.onQueryTheme),this.addEventListener("sp-language-context",this._handleContextPresence),this.updateComplete=this.__createDeferredPromise()}static get observedAttributes(){return["color","scale","theme","lang","dir"]}set dir(r){if(r===this.dir)return;this.setAttribute("dir",r),this._dir=r;const t=r==="rtl"?r:"ltr";this.trackedChildren.forEach(e=>{e.setAttribute("dir",t)})}get dir(){return this._dir}attributeChangedCallback(r,t,e){t!==e&&(r==="color"?this.color=e:r==="scale"?this.scale=e:r==="lang"&&e?(this.lang=e,this._provideContext()):r==="theme"?this.theme=e:r==="dir"&&(this.dir=e))}requestUpdate(){window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow?this.shouldAdoptStyles():window.ShadyCSS.styleElement(this)}get theme(){const r=C.themeFragmentsByKind.get("theme"),{name:t}=r&&r.get("default")||{};return this._theme||t||""}set theme(r){if(r===this._theme)return;const t=r&&Kr.includes(r)?r:this.theme;t!==this._theme&&(this._theme=t,this.requestUpdate()),t?this.setAttribute("theme",t):this.removeAttribute("theme")}get color(){const r=C.themeFragmentsByKind.get("color"),{name:t}=r&&r.get("default")||{};return this._color||t||""}set color(r){if(r===this._color)return;const t=r&&Wr.includes(r)?r:this.color;t!==this._color&&(this._color=t,this.requestUpdate()),t?this.setAttribute("color",t):this.removeAttribute("color")}get scale(){const r=C.themeFragmentsByKind.get("scale"),{name:t}=r&&r.get("default")||{};return this._scale||t||""}set scale(r){if(r===this._scale)return;const t=r&&Zr.includes(r)?r:this.scale;t!==this._scale&&(this._scale=t,this.requestUpdate()),t?this.setAttribute("scale",t):this.removeAttribute("scale")}get styles(){const r=[...C.themeFragmentsByKind.keys()],t=(e,o,a)=>{const s=a&&a!=="theme"&&this.theme==="express"?e.get(`${o}-express`):e.get(o),c=o==="spectrum"||!a||this.hasAttribute(a);if(s&&c)return s.styles};return[...r.reduce((e,o)=>{const a=C.themeFragmentsByKind.get(o);let s;if(o==="app"||o==="core")s=t(a,o);else{const{[o]:c}=this;s=t(a,c,o)}return s&&e.push(s),e},[])]}static get template(){return this.templateElement||(this.templateElement=document.createElement("template"),this.templateElement.innerHTML="<slot></slot>"),this.templateElement}__createDeferredPromise(){return new Promise(r=>{this.__resolve=r})}onQueryTheme(r){if(r.defaultPrevented)return;r.preventDefault();const{detail:t}=r;t.color=this.color||void 0,t.scale=this.scale||void 0,t.lang=this.lang||document.documentElement.lang||navigator.language,t.theme=this.theme||void 0}connectedCallback(){if(this.shouldAdoptStyles(),window.ShadyCSS!==void 0&&window.ShadyCSS.styleElement(this),C.instances.add(this),!this.hasAttribute("dir")){let r=this.assignedSlot||this.parentNode;for(;r!==document.documentElement&&!(r instanceof C);)r=r.assignedSlot||r.parentNode||r.host;this.dir=r.dir==="rtl"?r.dir:"ltr"}}disconnectedCallback(){C.instances.delete(this)}startManagingContentDirection(r){this.trackedChildren.add(r)}stopManagingContentDirection(r){this.trackedChildren.delete(r)}async shouldAdoptStyles(){this._updateRequested||(this.updateComplete=this.__createDeferredPromise(),this._updateRequested=!0,this._updateRequested=await!1,this.adoptStyles(),this.__resolve(!0))}adoptStyles(){const r=this.styles;if(window.ShadyCSS!==void 0&&!window.ShadyCSS.nativeShadow&&window.ShadyCSS.ScopingShim){const t=[];for(const[e,o]of C.themeFragmentsByKind)for(const[a,{styles:s}]of o){if(a==="default")continue;let c=s.cssText;C.defaultFragments.has(a)||(c=c.replace(":host",`:host([${e}='${a}'])`)),t.push(c)}window.ShadyCSS.ScopingShim.prepareAdoptedCssText(t,this.localName),window.ShadyCSS.prepareTemplate(C.template,this.localName)}else if(Lt){const t=[];for(const e of r)t.push(e.styleSheet);this.shadowRoot.adoptedStyleSheets=t}else this.shadowRoot.querySelectorAll("style").forEach(t=>t.remove()),r.forEach(t=>{const e=document.createElement("style");e.textContent=t.cssText,this.shadowRoot.appendChild(e)})}static registerThemeFragment(r,t,e){const o=C.themeFragmentsByKind.get(t)||new Map;o.size===0&&(C.themeFragmentsByKind.set(t,o),o.set("default",{name:r,styles:e}),C.defaultFragments.add(r)),o.set(r,{name:r,styles:e}),C.instances.forEach(a=>a.shouldAdoptStyles())}_provideContext(){this._contextConsumers.forEach(([r,t])=>r(this.lang,t))}_handleContextPresence(r){const t=r.composedPath()[0];if(this._contextConsumers.has(t))return;this._contextConsumers.set(t,[r.detail.callback,()=>this._contextConsumers.delete(t)]);const[e,o]=this._contextConsumers.get(t)||[];e&&o&&e(this.lang||document.documentElement.lang||navigator.language,o)}};let N=C;N.themeFragmentsByKind=new Map,N.defaultFragments=new Set(["spectrum"]),N.instances=new Set,customElements.define("sp-theme",N);var Qr=p`
:host,:root{--spectrum-global-color-status:Verified;--spectrum-global-color-version:5.1.0;--spectrum-global-color-opacity-100:1;--spectrum-global-color-opacity-90:0.9;--spectrum-global-color-opacity-80:0.8;--spectrum-global-color-opacity-70:0.7;--spectrum-global-color-opacity-60:0.6;--spectrum-global-color-opacity-55:0.55;--spectrum-global-color-opacity-50:0.5;--spectrum-global-color-opacity-42:0.42;--spectrum-global-color-opacity-40:0.4;--spectrum-global-color-opacity-30:0.3;--spectrum-global-color-opacity-25:0.25;--spectrum-global-color-opacity-20:0.2;--spectrum-global-color-opacity-15:0.15;--spectrum-global-color-opacity-10:0.1;--spectrum-global-color-opacity-8:0.08;--spectrum-global-color-opacity-7:0.07;--spectrum-global-color-opacity-6:0.06;--spectrum-global-color-opacity-5:0.05;--spectrum-global-color-opacity-4:0.04;--spectrum-global-color-opacity-0:0;--spectrum-global-color-celery-400-rgb:34,184,51;--spectrum-global-color-celery-400:rgb(var(--spectrum-global-color-celery-400-rgb));--spectrum-global-color-celery-500-rgb:68,202,73;--spectrum-global-color-celery-500:rgb(var(--spectrum-global-color-celery-500-rgb));--spectrum-global-color-celery-600-rgb:105,220,99;--spectrum-global-color-celery-600:rgb(var(--spectrum-global-color-celery-600-rgb));--spectrum-global-color-celery-700-rgb:142,235,127;--spectrum-global-color-celery-700:rgb(var(--spectrum-global-color-celery-700-rgb));--spectrum-global-color-chartreuse-400-rgb:148,192,8;--spectrum-global-color-chartreuse-400:rgb(var(--spectrum-global-color-chartreuse-400-rgb));--spectrum-global-color-chartreuse-500-rgb:166,211,18;--spectrum-global-color-chartreuse-500:rgb(var(--spectrum-global-color-chartreuse-500-rgb));--spectrum-global-color-chartreuse-600-rgb:184,229,37;--spectrum-global-color-chartreuse-600:rgb(var(--spectrum-global-color-chartreuse-600-rgb));--spectrum-global-color-chartreuse-700-rgb:205,245,71;--spectrum-global-color-chartreuse-700:rgb(var(--spectrum-global-color-chartreuse-700-rgb));--spectrum-global-color-yellow-400-rgb:228,194,0;--spectrum-global-color-yellow-400:rgb(var(--spectrum-global-color-yellow-400-rgb));--spectrum-global-color-yellow-500-rgb:244,213,0;--spectrum-global-color-yellow-500:rgb(var(--spectrum-global-color-yellow-500-rgb));--spectrum-global-color-yellow-600-rgb:249,232,92;--spectrum-global-color-yellow-600:rgb(var(--spectrum-global-color-yellow-600-rgb));--spectrum-global-color-yellow-700-rgb:252,246,187;--spectrum-global-color-yellow-700:rgb(var(--spectrum-global-color-yellow-700-rgb));--spectrum-global-color-magenta-400-rgb:222,61,130;--spectrum-global-color-magenta-400:rgb(var(--spectrum-global-color-magenta-400-rgb));--spectrum-global-color-magenta-500-rgb:237,87,149;--spectrum-global-color-magenta-500:rgb(var(--spectrum-global-color-magenta-500-rgb));--spectrum-global-color-magenta-600-rgb:249,114,167;--spectrum-global-color-magenta-600:rgb(var(--spectrum-global-color-magenta-600-rgb));--spectrum-global-color-magenta-700-rgb:255,143,185;--spectrum-global-color-magenta-700:rgb(var(--spectrum-global-color-magenta-700-rgb));--spectrum-global-color-fuchsia-400-rgb:205,57,206;--spectrum-global-color-fuchsia-400:rgb(var(--spectrum-global-color-fuchsia-400-rgb));--spectrum-global-color-fuchsia-500-rgb:223,81,224;--spectrum-global-color-fuchsia-500:rgb(var(--spectrum-global-color-fuchsia-500-rgb));--spectrum-global-color-fuchsia-600-rgb:235,110,236;--spectrum-global-color-fuchsia-600:rgb(var(--spectrum-global-color-fuchsia-600-rgb));--spectrum-global-color-fuchsia-700-rgb:244,140,242;--spectrum-global-color-fuchsia-700:rgb(var(--spectrum-global-color-fuchsia-700-rgb));--spectrum-global-color-purple-400-rgb:157,87,243;--spectrum-global-color-purple-400:rgb(var(--spectrum-global-color-purple-400-rgb));--spectrum-global-color-purple-500-rgb:172,111,249;--spectrum-global-color-purple-500:rgb(var(--spectrum-global-color-purple-500-rgb));--spectrum-global-color-purple-600-rgb:187,135,251;--spectrum-global-color-purple-600:rgb(var(--spectrum-global-color-purple-600-rgb));--spectrum-global-color-purple-700-rgb:202,159,252;--spectrum-global-color-purple-700:rgb(var(--spectrum-global-color-purple-700-rgb));--spectrum-global-color-indigo-400-rgb:104,109,244;--spectrum-global-color-indigo-400:rgb(var(--spectrum-global-color-indigo-400-rgb));--spectrum-global-color-indigo-500-rgb:124,129,251;--spectrum-global-color-indigo-500:rgb(var(--spectrum-global-color-indigo-500-rgb));--spectrum-global-color-indigo-600-rgb:145,149,255;--spectrum-global-color-indigo-600:rgb(var(--spectrum-global-color-indigo-600-rgb));--spectrum-global-color-indigo-700-rgb:167,170,255;--spectrum-global-color-indigo-700:rgb(var(--spectrum-global-color-indigo-700-rgb));--spectrum-global-color-seafoam-400-rgb:0,158,152;--spectrum-global-color-seafoam-400:rgb(var(--spectrum-global-color-seafoam-400-rgb));--spectrum-global-color-seafoam-500-rgb:3,178,171;--spectrum-global-color-seafoam-500:rgb(var(--spectrum-global-color-seafoam-500-rgb));--spectrum-global-color-seafoam-600-rgb:54,197,189;--spectrum-global-color-seafoam-600:rgb(var(--spectrum-global-color-seafoam-600-rgb));--spectrum-global-color-seafoam-700-rgb:93,214,207;--spectrum-global-color-seafoam-700:rgb(var(--spectrum-global-color-seafoam-700-rgb));--spectrum-global-color-red-400-rgb:234,56,41;--spectrum-global-color-red-400:rgb(var(--spectrum-global-color-red-400-rgb));--spectrum-global-color-red-500-rgb:246,88,67;--spectrum-global-color-red-500:rgb(var(--spectrum-global-color-red-500-rgb));--spectrum-global-color-red-600-rgb:255,117,94;--spectrum-global-color-red-600:rgb(var(--spectrum-global-color-red-600-rgb));--spectrum-global-color-red-700-rgb:255,149,129;--spectrum-global-color-red-700:rgb(var(--spectrum-global-color-red-700-rgb));--spectrum-global-color-orange-400-rgb:244,129,12;--spectrum-global-color-orange-400:rgb(var(--spectrum-global-color-orange-400-rgb));--spectrum-global-color-orange-500-rgb:254,154,46;--spectrum-global-color-orange-500:rgb(var(--spectrum-global-color-orange-500-rgb));--spectrum-global-color-orange-600-rgb:255,181,88;--spectrum-global-color-orange-600:rgb(var(--spectrum-global-color-orange-600-rgb));--spectrum-global-color-orange-700-rgb:253,206,136;--spectrum-global-color-orange-700:rgb(var(--spectrum-global-color-orange-700-rgb));--spectrum-global-color-green-400-rgb:18,162,108;--spectrum-global-color-green-400:rgb(var(--spectrum-global-color-green-400-rgb));--spectrum-global-color-green-500-rgb:43,180,125;--spectrum-global-color-green-500:rgb(var(--spectrum-global-color-green-500-rgb));--spectrum-global-color-green-600-rgb:67,199,143;--spectrum-global-color-green-600:rgb(var(--spectrum-global-color-green-600-rgb));--spectrum-global-color-green-700-rgb:94,217,162;--spectrum-global-color-green-700:rgb(var(--spectrum-global-color-green-700-rgb));--spectrum-global-color-blue-400-rgb:52,143,244;--spectrum-global-color-blue-400:rgb(var(--spectrum-global-color-blue-400-rgb));--spectrum-global-color-blue-500-rgb:84,163,246;--spectrum-global-color-blue-500:rgb(var(--spectrum-global-color-blue-500-rgb));--spectrum-global-color-blue-600-rgb:114,183,249;--spectrum-global-color-blue-600:rgb(var(--spectrum-global-color-blue-600-rgb));--spectrum-global-color-blue-700-rgb:143,202,252;--spectrum-global-color-blue-700:rgb(var(--spectrum-global-color-blue-700-rgb));--spectrum-global-color-gray-50-rgb:29,29,29;--spectrum-global-color-gray-50:rgb(var(--spectrum-global-color-gray-50-rgb));--spectrum-global-color-gray-75-rgb:38,38,38;--spectrum-global-color-gray-75:rgb(var(--spectrum-global-color-gray-75-rgb));--spectrum-global-color-gray-100-rgb:50,50,50;--spectrum-global-color-gray-100:rgb(var(--spectrum-global-color-gray-100-rgb));--spectrum-global-color-gray-200-rgb:63,63,63;--spectrum-global-color-gray-200:rgb(var(--spectrum-global-color-gray-200-rgb));--spectrum-global-color-gray-300-rgb:84,84,84;--spectrum-global-color-gray-300:rgb(var(--spectrum-global-color-gray-300-rgb));--spectrum-global-color-gray-400-rgb:112,112,112;--spectrum-global-color-gray-400:rgb(var(--spectrum-global-color-gray-400-rgb));--spectrum-global-color-gray-500-rgb:144,144,144;--spectrum-global-color-gray-500:rgb(var(--spectrum-global-color-gray-500-rgb));--spectrum-global-color-gray-600-rgb:178,178,178;--spectrum-global-color-gray-600:rgb(var(--spectrum-global-color-gray-600-rgb));--spectrum-global-color-gray-700-rgb:209,209,209;--spectrum-global-color-gray-700:rgb(var(--spectrum-global-color-gray-700-rgb));--spectrum-global-color-gray-800-rgb:235,235,235;--spectrum-global-color-gray-800:rgb(var(--spectrum-global-color-gray-800-rgb));--spectrum-global-color-gray-900-rgb:255,255,255;--spectrum-global-color-gray-900:rgb(var(--spectrum-global-color-gray-900-rgb));--spectrum-alias-background-color-primary:var(
--spectrum-global-color-gray-100
);--spectrum-alias-background-color-secondary:var(
--spectrum-global-color-gray-75
);--spectrum-alias-background-color-tertiary:var(
--spectrum-global-color-gray-50
);--spectrum-alias-background-color-modal-overlay:rgba(0,0,0,.5);--spectrum-alias-dropshadow-color:rgba(0,0,0,.5);--spectrum-alias-background-color-hover-overlay:hsla(0,0%,100%,.06);--spectrum-alias-highlight-hover:hsla(0,0%,100%,.07);--spectrum-alias-highlight-down:hsla(0,0%,100%,.1);--spectrum-alias-highlight-selected:rgba(84,163,246,.15);--spectrum-alias-highlight-selected-hover:rgba(84,163,246,.25);--spectrum-alias-text-highlight-color:rgba(84,163,246,.25);--spectrum-alias-background-color-quickactions:rgba(50,50,50,.9);--spectrum-alias-border-color-selected:var(
--spectrum-global-color-blue-600
);--spectrum-alias-border-color-translucent:hsla(0,0%,100%,.1);--spectrum-alias-radial-reaction-color-default:hsla(0,0%,92%,.6);--spectrum-alias-pasteboard-background-color:var(
--spectrum-global-color-gray-50
);--spectrum-alias-appframe-border-color:var(
--spectrum-global-color-gray-50
);--spectrum-alias-appframe-separator-color:var(
--spectrum-global-color-gray-50
);--spectrum-scrollbar-mac-s-track-background-color:var(
--spectrum-global-color-gray-100
);--spectrum-scrollbar-mac-m-track-background-color:var(
--spectrum-global-color-gray-100
);--spectrum-scrollbar-mac-l-track-background-color:var(
--spectrum-global-color-gray-100
);--spectrum-slider-s-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-ramp-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-range-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-ramp-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-range-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-ramp-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-range-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-ramp-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-s-range-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-ramp-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-range-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-ramp-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-range-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-ramp-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-range-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-ramp-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-m-range-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-ramp-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-range-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-ramp-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-range-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-ramp-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-range-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-ramp-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-l-range-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-ramp-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-range-tick-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-ramp-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-range-tick-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-ramp-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-range-editable-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-ramp-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-slider-xl-range-radial-reaction-color:hsla(0,0%,92%,.6);--spectrum-well-background-color:hsla(0,0%,92%,.02);--spectrum-well-border-color:hsla(0,0%,100%,.05)}:host,:root{color-scheme:dark}:host,:root{--spectrum-overlay-opacity:0.5;--spectrum-drop-shadow-color:rgba(0,0,0,.5);--spectrum-background-base-color:var(--spectrum-gray-50);--spectrum-background-layer-1-color:var(--spectrum-gray-75);--spectrum-background-layer-2-color:var(--spectrum-gray-100);--spectrum-neutral-background-color-default:var(--spectrum-gray-400);--spectrum-neutral-background-color-hover:var(--spectrum-gray-300);--spectrum-neutral-background-color-down:var(--spectrum-gray-200);--spectrum-neutral-background-color-key-focus:var(--spectrum-gray-300);--spectrum-neutral-subdued-background-color-default:var(
--spectrum-gray-400
);--spectrum-neutral-subdued-background-color-hover:var(--spectrum-gray-300);--spectrum-neutral-subdued-background-color-down:var(--spectrum-gray-200);--spectrum-neutral-subdued-background-color-key-focus:var(
--spectrum-gray-300
);--spectrum-accent-background-color-default:var(
--spectrum-accent-color-500
);--spectrum-accent-background-color-hover:var(--spectrum-accent-color-400);--spectrum-accent-background-color-down:var(--spectrum-accent-color-300);--spectrum-accent-background-color-key-focus:var(
--spectrum-accent-color-400
);--spectrum-informative-background-color-default:var(
--spectrum-informative-color-500
);--spectrum-informative-background-color-hover:var(
--spectrum-informative-color-400
);--spectrum-informative-background-color-down:var(
--spectrum-informative-color-300
);--spectrum-informative-background-color-key-focus:var(
--spectrum-informative-color-400
);--spectrum-negative-background-color-default:var(
--spectrum-negative-color-500
);--spectrum-negative-background-color-hover:var(
--spectrum-negative-color-400
);--spectrum-negative-background-color-down:var(
--spectrum-negative-color-300
);--spectrum-negative-background-color-key-focus:var(
--spectrum-negative-color-400
);--spectrum-positive-background-color-default:var(
--spectrum-positive-color-500
);--spectrum-positive-background-color-hover:var(
--spectrum-positive-color-400
);--spectrum-positive-background-color-down:var(
--spectrum-positive-color-300
);--spectrum-positive-background-color-key-focus:var(
--spectrum-positive-color-400
);--spectrum-notice-background-color-default:var(
--spectrum-notice-color-800
);--spectrum-gray-background-color-default:var(--spectrum-gray-700);--spectrum-red-background-color-default:var(--spectrum-red-700);--spectrum-orange-background-color-default:var(--spectrum-orange-800);--spectrum-yellow-background-color-default:var(--spectrum-yellow-1000);--spectrum-chartreuse-background-color-default:var(
--spectrum-chartreuse-900
);--spectrum-celery-background-color-default:var(--spectrum-celery-800);--spectrum-green-background-color-default:var(--spectrum-green-700);--spectrum-seafoam-background-color-default:var(--spectrum-seafoam-700);--spectrum-cyan-background-color-default:var(--spectrum-cyan-700);--spectrum-blue-background-color-default:var(--spectrum-blue-700);--spectrum-indigo-background-color-default:var(--spectrum-indigo-700);--spectrum-purple-background-color-default:var(--spectrum-purple-700);--spectrum-fuchsia-background-color-default:var(--spectrum-fuchsia-700);--spectrum-magenta-background-color-default:var(--spectrum-magenta-700);--spectrum-neutral-visual-color:var(--spectrum-gray-600);--spectrum-accent-visual-color:var(--spectrum-accent-color-900);--spectrum-informative-visual-color:var(--spectrum-informative-color-900);--spectrum-negative-visual-color:var(--spectrum-negative-color-700);--spectrum-notice-visual-color:var(--spectrum-notice-color-900);--spectrum-positive-visual-color:var(--spectrum-positive-color-800);--spectrum-gray-visual-color:var(--spectrum-gray-600);--spectrum-red-visual-color:var(--spectrum-red-700);--spectrum-orange-visual-color:var(--spectrum-orange-900);--spectrum-yellow-visual-color:var(--spectrum-yellow-1100);--spectrum-chartreuse-visual-color:var(--spectrum-chartreuse-900);--spectrum-celery-visual-color:var(--spectrum-celery-800);--spectrum-green-visual-color:var(--spectrum-green-800);--spectrum-seafoam-visual-color:var(--spectrum-seafoam-800);--spectrum-cyan-visual-color:var(--spectrum-cyan-900);--spectrum-blue-visual-color:var(--spectrum-blue-900);--spectrum-indigo-visual-color:var(--spectrum-indigo-900);--spectrum-purple-visual-color:var(--spectrum-purple-900);--spectrum-fuchsia-visual-color:var(--spectrum-fuchsia-900);--spectrum-magenta-visual-color:var(--spectrum-magenta-900);--spectrum-opacity-checkerboard-square-dark:var(--spectrum-gray-800);--spectrum-gray-50:#1d1d1d;--spectrum-gray-75:#262626;--spectrum-gray-100:#323232;--spectrum-gray-200:#3f3f3f;--spectrum-gray-300:#545454;--spectrum-gray-400:#707070;--spectrum-gray-500:#909090;--spectrum-gray-600:#b2b2b2;--spectrum-gray-700:#d1d1d1;--spectrum-gray-800:#ebebeb;--spectrum-gray-900:#fff;--spectrum-blue-100:#003877;--spectrum-blue-200:#00418a;--spectrum-blue-300:#004da3;--spectrum-blue-400:#0059c2;--spectrum-blue-500:#0367e0;--spectrum-blue-600:#1379f3;--spectrum-blue-700:#348ff4;--spectrum-blue-800:#54a3f6;--spectrum-blue-900:#72b7f9;--spectrum-blue-1000:#8fcafc;--spectrum-blue-1100:#aedbfe;--spectrum-blue-1200:#cce9ff;--spectrum-blue-1300:#e8f6ff;--spectrum-blue-1400:#fff;--spectrum-red-100:#7b0000;--spectrum-red-200:#8d0000;--spectrum-red-300:#a50000;--spectrum-red-400:#be0403;--spectrum-red-500:#d71913;--spectrum-red-600:#ea3829;--spectrum-red-700:#f65843;--spectrum-red-800:#ff755e;--spectrum-red-900:#ff9581;--spectrum-red-1000:#ffb0a1;--spectrum-red-1100:#ffc9bd;--spectrum-red-1200:#ffded8;--spectrum-red-1300:#fff1ee;--spectrum-red-1400:#fff;--spectrum-orange-100:#662500;--spectrum-orange-200:#752d00;--spectrum-orange-300:#893700;--spectrum-orange-400:#9e4200;--spectrum-orange-500:#b44e00;--spectrum-orange-600:#ca5d00;--spectrum-orange-700:#e16d00;--spectrum-orange-800:#f4810c;--spectrum-orange-900:#fe9a2e;--spectrum-orange-1000:#ffb558;--spectrum-orange-1100:#fdce88;--spectrum-orange-1200:#ffe1b3;--spectrum-orange-1300:#fff2dd;--spectrum-orange-1400:#fffdf9;--spectrum-yellow-100:#4c3600;--spectrum-yellow-200:#584000;--spectrum-yellow-300:#674c00;--spectrum-yellow-400:#775900;--spectrum-yellow-500:#886800;--spectrum-yellow-600:#9b7800;--spectrum-yellow-700:#ae8900;--spectrum-yellow-800:#c09c00;--spectrum-yellow-900:#d3ae00;--spectrum-yellow-1000:#e4c200;--spectrum-yellow-1100:#f4d500;--spectrum-yellow-1200:#f9e85c;--spectrum-yellow-1300:#fcf6bb;--spectrum-yellow-1400:#fff;--spectrum-chartreuse-100:#304000;--spectrum-chartreuse-200:#374a00;--spectrum-chartreuse-300:#415700;--spectrum-chartreuse-400:#4c6600;--spectrum-chartreuse-500:#597600;--spectrum-chartreuse-600:#680;--spectrum-chartreuse-700:#759a00;--spectrum-chartreuse-800:#84ad01;--spectrum-chartreuse-900:#94c008;--spectrum-chartreuse-1000:#a6d312;--spectrum-chartreuse-1100:#b8e525;--spectrum-chartreuse-1200:#cdf547;--spectrum-chartreuse-1300:#e7fe9a;--spectrum-chartreuse-1400:#fff;--spectrum-celery-100:#00450a;--spectrum-celery-200:#00500c;--spectrum-celery-300:#005e0e;--spectrum-celery-400:#006d0f;--spectrum-celery-500:#007f0f;--spectrum-celery-600:#009112;--spectrum-celery-700:#04a51e;--spectrum-celery-800:#22b833;--spectrum-celery-900:#44ca49;--spectrum-celery-1000:#69dc63;--spectrum-celery-1100:#8eeb7f;--spectrum-celery-1200:#b4f7a2;--spectrum-celery-1300:#ddfdd3;--spectrum-celery-1400:#fff;--spectrum-green-100:#044329;--spectrum-green-200:#004e2f;--spectrum-green-300:#005c38;--spectrum-green-400:#006c43;--spectrum-green-500:#007d4e;--spectrum-green-600:#008f5d;--spectrum-green-700:#12a26c;--spectrum-green-800:#2bb47d;--spectrum-green-900:#43c78f;--spectrum-green-1000:#5ed9a2;--spectrum-green-1100:#81e9b8;--spectrum-green-1200:#b1f4d1;--spectrum-green-1300:#dffaea;--spectrum-green-1400:#fefffc;--spectrum-seafoam-100:#12413f;--spectrum-seafoam-200:#0e4c49;--spectrum-seafoam-300:#045a57;--spectrum-seafoam-400:#006965;--spectrum-seafoam-500:#007a75;--spectrum-seafoam-600:#008c87;--spectrum-seafoam-700:#009e98;--spectrum-seafoam-800:#03b2ab;--spectrum-seafoam-900:#36c5bd;--spectrum-seafoam-1000:#5dd6cf;--spectrum-seafoam-1100:#84e6df;--spectrum-seafoam-1200:#b0f2ec;--spectrum-seafoam-1300:#dff9f6;--spectrum-seafoam-1400:#fefffe;--spectrum-cyan-100:#003d62;--spectrum-cyan-200:#00476f;--spectrum-cyan-300:#00557f;--spectrum-cyan-400:#006491;--spectrum-cyan-500:#0074a2;--spectrum-cyan-600:#0086b4;--spectrum-cyan-700:#0099c6;--spectrum-cyan-800:#0eadd7;--spectrum-cyan-900:#2cc1e6;--spectrum-cyan-1000:#54d3f1;--spectrum-cyan-1100:#7fe4f9;--spectrum-cyan-1200:#a7f1ff;--spectrum-cyan-1300:#d7faff;--spectrum-cyan-1400:#fff;--spectrum-indigo-100:#282c8c;--spectrum-indigo-200:#2f34a3;--spectrum-indigo-300:#393fbb;--spectrum-indigo-400:#464bd3;--spectrum-indigo-500:#555be7;--spectrum-indigo-600:#686df4;--spectrum-indigo-700:#7c81fb;--spectrum-indigo-800:#9195ff;--spectrum-indigo-900:#a7aaff;--spectrum-indigo-1000:#bcbeff;--spectrum-indigo-1100:#d0d2ff;--spectrum-indigo-1200:#e2e4ff;--spectrum-indigo-1300:#f3f3fe;--spectrum-indigo-1400:#fff;--spectrum-purple-100:#4c0d9d;--spectrum-purple-200:#5911b1;--spectrum-purple-300:#691cc8;--spectrum-purple-400:#7a2dda;--spectrum-purple-500:#8c41e9;--spectrum-purple-600:#9d57f3;--spectrum-purple-700:#ac6ff9;--spectrum-purple-800:#bb87fb;--spectrum-purple-900:#ca9ffc;--spectrum-purple-1000:#d7b6fe;--spectrum-purple-1100:#e4ccfe;--spectrum-purple-1200:#efdfff;--spectrum-purple-1300:#f9f0ff;--spectrum-purple-1400:#fffdff;--spectrum-fuchsia-100:#6b036a;--spectrum-fuchsia-200:#7b007b;--spectrum-fuchsia-300:#900091;--spectrum-fuchsia-400:#a50da6;--spectrum-fuchsia-500:#b925b9;--spectrum-fuchsia-600:#cd39ce;--spectrum-fuchsia-700:#df51e0;--spectrum-fuchsia-800:#eb6eec;--spectrum-fuchsia-900:#f48cf2;--spectrum-fuchsia-1000:#faa8f5;--spectrum-fuchsia-1100:#fec2f8;--spectrum-fuchsia-1200:#ffdbfa;--spectrum-fuchsia-1300:#ffeffc;--spectrum-fuchsia-1400:#fffdff;--spectrum-magenta-100:#76003a;--spectrum-magenta-200:#890042;--spectrum-magenta-300:#a0004d;--spectrum-magenta-400:#b6125a;--spectrum-magenta-500:#cb266d;--spectrum-magenta-600:#de3d82;--spectrum-magenta-700:#ed5795;--spectrum-magenta-800:#f972a7;--spectrum-magenta-900:#ff8fb9;--spectrum-magenta-1000:#ffacca;--spectrum-magenta-1100:#ffc6da;--spectrum-magenta-1200:#ffdde9;--spectrum-magenta-1300:#fff0f5;--spectrum-magenta-1400:#fffcfd}
`,Yr=p`
:host,:root{--spectrum-global-animation-linear:cubic-bezier(0,0,1,1);--spectrum-global-animation-duration-0:0ms;--spectrum-global-animation-duration-100:130ms;--spectrum-global-animation-duration-200:160ms;--spectrum-global-animation-duration-300:190ms;--spectrum-global-animation-duration-400:220ms;--spectrum-global-animation-duration-500:250ms;--spectrum-global-animation-duration-600:300ms;--spectrum-global-animation-duration-700:350ms;--spectrum-global-animation-duration-800:400ms;--spectrum-global-animation-duration-900:450ms;--spectrum-global-animation-duration-1000:500ms;--spectrum-global-animation-duration-2000:1000ms;--spectrum-global-animation-duration-4000:2000ms;--spectrum-global-animation-ease-in-out:cubic-bezier(0.45,0,0.4,1);--spectrum-global-animation-ease-in:cubic-bezier(0.5,0,1,1);--spectrum-global-animation-ease-out:cubic-bezier(0,0,0.4,1);--spectrum-global-animation-ease-linear:cubic-bezier(0,0,1,1);--spectrum-global-color-status:Verified;--spectrum-global-color-version:5.1.0;--spectrum-global-color-static-black-rgb:0,0,0;--spectrum-global-color-static-black:rgb(var(--spectrum-global-color-static-black-rgb));--spectrum-global-color-static-white-rgb:255,255,255;--spectrum-global-color-static-white:rgb(var(--spectrum-global-color-static-white-rgb));--spectrum-global-color-static-blue-rgb:0,87,191;--spectrum-global-color-static-blue:rgb(var(--spectrum-global-color-static-blue-rgb));--spectrum-global-color-static-gray-50-rgb:255,255,255;--spectrum-global-color-static-gray-50:rgb(var(--spectrum-global-color-static-gray-50-rgb));--spectrum-global-color-static-gray-75-rgb:255,255,255;--spectrum-global-color-static-gray-75:rgb(var(--spectrum-global-color-static-gray-75-rgb));--spectrum-global-color-static-gray-100-rgb:255,255,255;--spectrum-global-color-static-gray-100:rgb(var(--spectrum-global-color-static-gray-100-rgb));--spectrum-global-color-static-gray-200-rgb:235,235,235;--spectrum-global-color-static-gray-200:rgb(var(--spectrum-global-color-static-gray-200-rgb));--spectrum-global-color-static-gray-300-rgb:217,217,217;--spectrum-global-color-static-gray-300:rgb(var(--spectrum-global-color-static-gray-300-rgb));--spectrum-global-color-static-gray-400-rgb:179,179,179;--spectrum-global-color-static-gray-400:rgb(var(--spectrum-global-color-static-gray-400-rgb));--spectrum-global-color-static-gray-500-rgb:146,146,146;--spectrum-global-color-static-gray-500:rgb(var(--spectrum-global-color-static-gray-500-rgb));--spectrum-global-color-static-gray-600-rgb:110,110,110;--spectrum-global-color-static-gray-600:rgb(var(--spectrum-global-color-static-gray-600-rgb));--spectrum-global-color-static-gray-700-rgb:71,71,71;--spectrum-global-color-static-gray-700:rgb(var(--spectrum-global-color-static-gray-700-rgb));--spectrum-global-color-static-gray-800-rgb:34,34,34;--spectrum-global-color-static-gray-800:rgb(var(--spectrum-global-color-static-gray-800-rgb));--spectrum-global-color-static-gray-900-rgb:0,0,0;--spectrum-global-color-static-gray-900:rgb(var(--spectrum-global-color-static-gray-900-rgb));--spectrum-global-color-static-red-400-rgb:237,64,48;--spectrum-global-color-static-red-400:rgb(var(--spectrum-global-color-static-red-400-rgb));--spectrum-global-color-static-red-500-rgb:217,28,21;--spectrum-global-color-static-red-500:rgb(var(--spectrum-global-color-static-red-500-rgb));--spectrum-global-color-static-red-600-rgb:187,2,2;--spectrum-global-color-static-red-600:rgb(var(--spectrum-global-color-static-red-600-rgb));--spectrum-global-color-static-red-700-rgb:154,0,0;--spectrum-global-color-static-red-700:rgb(var(--spectrum-global-color-static-red-700-rgb));--spectrum-global-color-static-red-800-rgb:124,0,0;--spectrum-global-color-static-red-800:rgb(var(--spectrum-global-color-static-red-800-rgb));--spectrum-global-color-static-orange-400-rgb:250,139,26;--spectrum-global-color-static-orange-400:rgb(var(--spectrum-global-color-static-orange-400-rgb));--spectrum-global-color-static-orange-500-rgb:233,117,0;--spectrum-global-color-static-orange-500:rgb(var(--spectrum-global-color-static-orange-500-rgb));--spectrum-global-color-static-orange-600-rgb:209,97,0;--spectrum-global-color-static-orange-600:rgb(var(--spectrum-global-color-static-orange-600-rgb));--spectrum-global-color-static-orange-700-rgb:182,80,0;--spectrum-global-color-static-orange-700:rgb(var(--spectrum-global-color-static-orange-700-rgb));--spectrum-global-color-static-orange-800-rgb:155,64,0;--spectrum-global-color-static-orange-800:rgb(var(--spectrum-global-color-static-orange-800-rgb));--spectrum-global-color-static-yellow-200-rgb:250,237,123;--spectrum-global-color-static-yellow-200:rgb(var(--spectrum-global-color-static-yellow-200-rgb));--spectrum-global-color-static-yellow-300-rgb:250,224,23;--spectrum-global-color-static-yellow-300:rgb(var(--spectrum-global-color-static-yellow-300-rgb));--spectrum-global-color-static-yellow-400-rgb:238,205,0;--spectrum-global-color-static-yellow-400:rgb(var(--spectrum-global-color-static-yellow-400-rgb));--spectrum-global-color-static-yellow-500-rgb:221,185,0;--spectrum-global-color-static-yellow-500:rgb(var(--spectrum-global-color-static-yellow-500-rgb));--spectrum-global-color-static-yellow-600-rgb:201,164,0;--spectrum-global-color-static-yellow-600:rgb(var(--spectrum-global-color-static-yellow-600-rgb));--spectrum-global-color-static-yellow-700-rgb:181,144,0;--spectrum-global-color-static-yellow-700:rgb(var(--spectrum-global-color-static-yellow-700-rgb));--spectrum-global-color-static-yellow-800-rgb:160,125,0;--spectrum-global-color-static-yellow-800:rgb(var(--spectrum-global-color-static-yellow-800-rgb));--spectrum-global-color-static-chartreuse-300-rgb:176,222,27;--spectrum-global-color-static-chartreuse-300:rgb(var(--spectrum-global-color-static-chartreuse-300-rgb));--spectrum-global-color-static-chartreuse-400-rgb:157,203,13;--spectrum-global-color-static-chartreuse-400:rgb(var(--spectrum-global-color-static-chartreuse-400-rgb));--spectrum-global-color-static-chartreuse-500-rgb:139,182,4;--spectrum-global-color-static-chartreuse-500:rgb(var(--spectrum-global-color-static-chartreuse-500-rgb));--spectrum-global-color-static-chartreuse-600-rgb:122,162,0;--spectrum-global-color-static-chartreuse-600:rgb(var(--spectrum-global-color-static-chartreuse-600-rgb));--spectrum-global-color-static-chartreuse-700-rgb:106,141,0;--spectrum-global-color-static-chartreuse-700:rgb(var(--spectrum-global-color-static-chartreuse-700-rgb));--spectrum-global-color-static-chartreuse-800-rgb:90,120,0;--spectrum-global-color-static-chartreuse-800:rgb(var(--spectrum-global-color-static-chartreuse-800-rgb));--spectrum-global-color-static-celery-200-rgb:126,229,114;--spectrum-global-color-static-celery-200:rgb(var(--spectrum-global-color-static-celery-200-rgb));--spectrum-global-color-static-celery-300-rgb:87,212,86;--spectrum-global-color-static-celery-300:rgb(var(--spectrum-global-color-static-celery-300-rgb));--spectrum-global-color-static-celery-400-rgb:48,193,61;--spectrum-global-color-static-celery-400:rgb(var(--spectrum-global-color-static-celery-400-rgb));--spectrum-global-color-static-celery-500-rgb:15,172,38;--spectrum-global-color-static-celery-500:rgb(var(--spectrum-global-color-static-celery-500-rgb));--spectrum-global-color-static-celery-600-rgb:0,150,20;--spectrum-global-color-static-celery-600:rgb(var(--spectrum-global-color-static-celery-600-rgb));--spectrum-global-color-static-celery-700-rgb:0,128,15;--spectrum-global-color-static-celery-700:rgb(var(--spectrum-global-color-static-celery-700-rgb));--spectrum-global-color-static-celery-800-rgb:0,107,15;--spectrum-global-color-static-celery-800:rgb(var(--spectrum-global-color-static-celery-800-rgb));--spectrum-global-color-static-green-400-rgb:29,169,115;--spectrum-global-color-static-green-400:rgb(var(--spectrum-global-color-static-green-400-rgb));--spectrum-global-color-static-green-500-rgb:0,148,97;--spectrum-global-color-static-green-500:rgb(var(--spectrum-global-color-static-green-500-rgb));--spectrum-global-color-static-green-600-rgb:0,126,80;--spectrum-global-color-static-green-600:rgb(var(--spectrum-global-color-static-green-600-rgb));--spectrum-global-color-static-green-700-rgb:0,105,65;--spectrum-global-color-static-green-700:rgb(var(--spectrum-global-color-static-green-700-rgb));--spectrum-global-color-static-green-800-rgb:0,86,53;--spectrum-global-color-static-green-800:rgb(var(--spectrum-global-color-static-green-800-rgb));--spectrum-global-color-static-seafoam-200-rgb:75,206,199;--spectrum-global-color-static-seafoam-200:rgb(var(--spectrum-global-color-static-seafoam-200-rgb));--spectrum-global-color-static-seafoam-300-rgb:32,187,180;--spectrum-global-color-static-seafoam-300:rgb(var(--spectrum-global-color-static-seafoam-300-rgb));--spectrum-global-color-static-seafoam-400-rgb:0,166,160;--spectrum-global-color-static-seafoam-400:rgb(var(--spectrum-global-color-static-seafoam-400-rgb));--spectrum-global-color-static-seafoam-500-rgb:0,145,139;--spectrum-global-color-static-seafoam-500:rgb(var(--spectrum-global-color-static-seafoam-500-rgb));--spectrum-global-color-static-seafoam-600-rgb:0,124,118;--spectrum-global-color-static-seafoam-600:rgb(var(--spectrum-global-color-static-seafoam-600-rgb));--spectrum-global-color-static-seafoam-700-rgb:0,103,99;--spectrum-global-color-static-seafoam-700:rgb(var(--spectrum-global-color-static-seafoam-700-rgb));--spectrum-global-color-static-seafoam-800-rgb:10,83,80;--spectrum-global-color-static-seafoam-800:rgb(var(--spectrum-global-color-static-seafoam-800-rgb));--spectrum-global-color-static-blue-200-rgb:130,193,251;--spectrum-global-color-static-blue-200:rgb(var(--spectrum-global-color-static-blue-200-rgb));--spectrum-global-color-static-blue-300-rgb:98,173,247;--spectrum-global-color-static-blue-300:rgb(var(--spectrum-global-color-static-blue-300-rgb));--spectrum-global-color-static-blue-400-rgb:66,151,244;--spectrum-global-color-static-blue-400:rgb(var(--spectrum-global-color-static-blue-400-rgb));--spectrum-global-color-static-blue-500-rgb:27,127,245;--spectrum-global-color-static-blue-500:rgb(var(--spectrum-global-color-static-blue-500-rgb));--spectrum-global-color-static-blue-600-rgb:4,105,227;--spectrum-global-color-static-blue-600:rgb(var(--spectrum-global-color-static-blue-600-rgb));--spectrum-global-color-static-blue-700-rgb:0,87,190;--spectrum-global-color-static-blue-700:rgb(var(--spectrum-global-color-static-blue-700-rgb));--spectrum-global-color-static-blue-800-rgb:0,72,153;--spectrum-global-color-static-blue-800:rgb(var(--spectrum-global-color-static-blue-800-rgb));--spectrum-global-color-static-indigo-200-rgb:178,181,255;--spectrum-global-color-static-indigo-200:rgb(var(--spectrum-global-color-static-indigo-200-rgb));--spectrum-global-color-static-indigo-300-rgb:155,159,255;--spectrum-global-color-static-indigo-300:rgb(var(--spectrum-global-color-static-indigo-300-rgb));--spectrum-global-color-static-indigo-400-rgb:132,137,253;--spectrum-global-color-static-indigo-400:rgb(var(--spectrum-global-color-static-indigo-400-rgb));--spectrum-global-color-static-indigo-500-rgb:109,115,246;--spectrum-global-color-static-indigo-500:rgb(var(--spectrum-global-color-static-indigo-500-rgb));--spectrum-global-color-static-indigo-600-rgb:87,93,232;--spectrum-global-color-static-indigo-600:rgb(var(--spectrum-global-color-static-indigo-600-rgb));--spectrum-global-color-static-indigo-700-rgb:68,74,208;--spectrum-global-color-static-indigo-700:rgb(var(--spectrum-global-color-static-indigo-700-rgb));--spectrum-global-color-static-indigo-800-rgb:68,74,208;--spectrum-global-color-static-indigo-800:rgb(var(--spectrum-global-color-static-indigo-800-rgb));--spectrum-global-color-static-purple-400-rgb:178,121,250;--spectrum-global-color-static-purple-400:rgb(var(--spectrum-global-color-static-purple-400-rgb));--spectrum-global-color-static-purple-500-rgb:161,93,246;--spectrum-global-color-static-purple-500:rgb(var(--spectrum-global-color-static-purple-500-rgb));--spectrum-global-color-static-purple-600-rgb:142,67,234;--spectrum-global-color-static-purple-600:rgb(var(--spectrum-global-color-static-purple-600-rgb));--spectrum-global-color-static-purple-700-rgb:120,43,216;--spectrum-global-color-static-purple-700:rgb(var(--spectrum-global-color-static-purple-700-rgb));--spectrum-global-color-static-purple-800-rgb:98,23,190;--spectrum-global-color-static-purple-800:rgb(var(--spectrum-global-color-static-purple-800-rgb));--spectrum-global-color-static-fuchsia-400-rgb:228,93,230;--spectrum-global-color-static-fuchsia-400:rgb(var(--spectrum-global-color-static-fuchsia-400-rgb));--spectrum-global-color-static-fuchsia-500-rgb:211,63,212;--spectrum-global-color-static-fuchsia-500:rgb(var(--spectrum-global-color-static-fuchsia-500-rgb));--spectrum-global-color-static-fuchsia-600-rgb:188,39,187;--spectrum-global-color-static-fuchsia-600:rgb(var(--spectrum-global-color-static-fuchsia-600-rgb));--spectrum-global-color-static-fuchsia-700-rgb:163,10,163;--spectrum-global-color-static-fuchsia-700:rgb(var(--spectrum-global-color-static-fuchsia-700-rgb));--spectrum-global-color-static-fuchsia-800-rgb:135,0,136;--spectrum-global-color-static-fuchsia-800:rgb(var(--spectrum-global-color-static-fuchsia-800-rgb));--spectrum-global-color-static-magenta-200-rgb:253,127,175;--spectrum-global-color-static-magenta-200:rgb(var(--spectrum-global-color-static-magenta-200-rgb));--spectrum-global-color-static-magenta-300-rgb:242,98,157;--spectrum-global-color-static-magenta-300:rgb(var(--spectrum-global-color-static-magenta-300-rgb));--spectrum-global-color-static-magenta-400-rgb:226,68,135;--spectrum-global-color-static-magenta-400:rgb(var(--spectrum-global-color-static-magenta-400-rgb));--spectrum-global-color-static-magenta-500-rgb:205,40,111;--spectrum-global-color-static-magenta-500:rgb(var(--spectrum-global-color-static-magenta-500-rgb));--spectrum-global-color-static-magenta-600-rgb:179,15,89;--spectrum-global-color-static-magenta-600:rgb(var(--spectrum-global-color-static-magenta-600-rgb));--spectrum-global-color-static-magenta-700-rgb:149,0,72;--spectrum-global-color-static-magenta-700:rgb(var(--spectrum-global-color-static-magenta-700-rgb));--spectrum-global-color-static-magenta-800-rgb:119,0,58;--spectrum-global-color-static-magenta-800:rgb(var(--spectrum-global-color-static-magenta-800-rgb));--spectrum-global-color-static-transparent-white-200:hsla(0,0%,100%,.1);--spectrum-global-color-static-transparent-white-300:hsla(0,0%,100%,.25);--spectrum-global-color-static-transparent-white-400:hsla(0,0%,100%,.4);--spectrum-global-color-static-transparent-white-500:hsla(0,0%,100%,.55);--spectrum-global-color-static-transparent-white-600:hsla(0,0%,100%,.7);--spectrum-global-color-static-transparent-white-700:hsla(0,0%,100%,.8);--spectrum-global-color-static-transparent-white-800:hsla(0,0%,100%,.9);--spectrum-global-color-static-transparent-white-900-rgb:255,255,255;--spectrum-global-color-static-transparent-white-900:rgb(var(--spectrum-global-color-static-transparent-white-900-rgb));--spectrum-global-color-static-transparent-black-200:rgba(0,0,0,.1);--spectrum-global-color-static-transparent-black-300:rgba(0,0,0,.25);--spectrum-global-color-static-transparent-black-400:rgba(0,0,0,.4);--spectrum-global-color-static-transparent-black-500:rgba(0,0,0,.55);--spectrum-global-color-static-transparent-black-600:rgba(0,0,0,.7);--spectrum-global-color-static-transparent-black-700:rgba(0,0,0,.8);--spectrum-global-color-static-transparent-black-800:rgba(0,0,0,.9);--spectrum-global-color-static-transparent-black-900-rgb:0,0,0;--spectrum-global-color-static-transparent-black-900:rgb(var(--spectrum-global-color-static-transparent-black-900-rgb));--spectrum-global-color-sequential-cerulean:#e9fff1,#c8f1e4,#a5e3d7,#82d5ca,#68c5c1,#54b4ba,#3fa2b2,#2991ac,#2280a2,#1f6d98,#1d5c8d,#1a4b83,#1a3979,#1a266f,#191264,#180057;--spectrum-global-color-sequential-forest:#ffffdf,#e2f6ba,#c4eb95,#a4e16d,#8dd366,#77c460,#5fb65a,#48a754,#36984f,#2c894d,#237a4a,#196b47,#105c45,#094d41,#033f3e,#00313a;--spectrum-global-color-sequential-rose:#fff4dd,#ffddd7,#ffc5d2,#feaecb,#fa96c4,#f57ebd,#ef64b5,#e846ad,#d238a1,#bb2e96,#a3248c,#8a1b83,#71167c,#560f74,#370b6e,#000968;--spectrum-global-color-diverging-orange-yellow-seafoam:#580000,#79260b,#9c4511,#bd651a,#dd8629,#f5ad52,#fed693,#ffffe0,#bbe4d1,#76c7be,#3ea8a6,#208288,#076769,#00494b,#002c2d;--spectrum-global-color-diverging-red-yellow-blue:#4a001e,#751232,#a52747,#c65154,#e47961,#f0a882,#fad4ac,#ffffe0,#bce2cf,#89c0c4,#579eb9,#397aa8,#1c5796,#163771,#10194d;--spectrum-global-color-diverging-red-blue:#4a001e,#731331,#9f2945,#cc415a,#e06e85,#ed9ab0,#f8c3d9,#faf0ff,#c6d0f2,#92b2de,#5d94cb,#2f74b3,#265191,#163670,#0b194c;--spectrum-semantic-negative-background-color:var(
--spectrum-global-color-static-red-600
);--spectrum-semantic-negative-color-default:var(
--spectrum-global-color-red-500
);--spectrum-semantic-negative-color-hover:var(
--spectrum-global-color-red-600
);--spectrum-semantic-negative-color-dark:var(
--spectrum-global-color-red-600
);--spectrum-semantic-negative-border-color:var(
--spectrum-global-color-red-400
);--spectrum-semantic-negative-icon-color:var(
--spectrum-global-color-red-600
);--spectrum-semantic-negative-status-color:var(
--spectrum-global-color-red-400
);--spectrum-semantic-negative-text-color-large:var(
--spectrum-global-color-red-500
);--spectrum-semantic-negative-text-color-small:var(
--spectrum-global-color-red-600
);--spectrum-semantic-negative-text-color-small-hover:var(
--spectrum-global-color-red-700
);--spectrum-semantic-negative-text-color-small-down:var(
--spectrum-global-color-red-700
);--spectrum-semantic-negative-text-color-small-key-focus:var(
--spectrum-global-color-red-600
);--spectrum-semantic-negative-color-down:var(
--spectrum-global-color-red-700
);--spectrum-semantic-negative-color-key-focus:var(
--spectrum-global-color-red-400
);--spectrum-semantic-negative-background-color-default:var(
--spectrum-global-color-static-red-600
);--spectrum-semantic-negative-background-color-hover:var(
--spectrum-global-color-static-red-700
);--spectrum-semantic-negative-background-color-down:var(
--spectrum-global-color-static-red-800
);--spectrum-semantic-negative-background-color-key-focus:var(
--spectrum-global-color-static-red-700
);--spectrum-semantic-notice-background-color:var(
--spectrum-global-color-static-orange-600
);--spectrum-semantic-notice-color-default:var(
--spectrum-global-color-orange-500
);--spectrum-semantic-notice-color-dark:var(
--spectrum-global-color-orange-600
);--spectrum-semantic-notice-border-color:var(
--spectrum-global-color-orange-400
);--spectrum-semantic-notice-icon-color:var(
--spectrum-global-color-orange-600
);--spectrum-semantic-notice-status-color:var(
--spectrum-global-color-orange-400
);--spectrum-semantic-notice-text-color-large:var(
--spectrum-global-color-orange-500
);--spectrum-semantic-notice-text-color-small:var(
--spectrum-global-color-orange-600
);--spectrum-semantic-notice-color-down:var(
--spectrum-global-color-orange-700
);--spectrum-semantic-notice-color-key-focus:var(
--spectrum-global-color-orange-400
);--spectrum-semantic-notice-background-color-default:var(
--spectrum-global-color-static-orange-600
);--spectrum-semantic-notice-background-color-hover:var(
--spectrum-global-color-static-orange-700
);--spectrum-semantic-notice-background-color-down:var(
--spectrum-global-color-static-orange-800
);--spectrum-semantic-notice-background-color-key-focus:var(
--spectrum-global-color-static-orange-700
);--spectrum-semantic-positive-background-color:var(
--spectrum-global-color-static-green-600
);--spectrum-semantic-positive-color-default:var(
--spectrum-global-color-green-500
);--spectrum-semantic-positive-color-dark:var(
--spectrum-global-color-green-600
);--spectrum-semantic-positive-border-color:var(
--spectrum-global-color-green-400
);--spectrum-semantic-positive-icon-color:var(
--spectrum-global-color-green-600
);--spectrum-semantic-positive-status-color:var(
--spectrum-global-color-green-400
);--spectrum-semantic-positive-text-color-large:var(
--spectrum-global-color-green-500
);--spectrum-semantic-positive-text-color-small:var(
--spectrum-global-color-green-600
);--spectrum-semantic-positive-color-down:var(
--spectrum-global-color-green-700
);--spectrum-semantic-positive-color-key-focus:var(
--spectrum-global-color-green-400
);--spectrum-semantic-positive-background-color-default:var(
--spectrum-global-color-static-green-600
);--spectrum-semantic-positive-background-color-hover:var(
--spectrum-global-color-static-green-700
);--spectrum-semantic-positive-background-color-down:var(
--spectrum-global-color-static-green-800
);--spectrum-semantic-positive-background-color-key-focus:var(
--spectrum-global-color-static-green-700
);--spectrum-semantic-informative-background-color:var(
--spectrum-global-color-static-blue-600
);--spectrum-semantic-informative-color-default:var(
--spectrum-global-color-blue-500
);--spectrum-semantic-informative-color-dark:var(
--spectrum-global-color-blue-600
);--spectrum-semantic-informative-border-color:var(
--spectrum-global-color-blue-400
);--spectrum-semantic-informative-icon-color:var(
--spectrum-global-color-blue-600
);--spectrum-semantic-informative-status-color:var(
--spectrum-global-color-blue-400
);--spectrum-semantic-informative-text-color-large:var(
--spectrum-global-color-blue-500
);--spectrum-semantic-informative-text-color-small:var(
--spectrum-global-color-blue-600
);--spectrum-semantic-informative-color-down:var(
--spectrum-global-color-blue-700
);--spectrum-semantic-informative-color-key-focus:var(
--spectrum-global-color-blue-400
);--spectrum-semantic-informative-background-color-default:var(
--spectrum-global-color-static-blue-600
);--spectrum-semantic-informative-background-color-hover:var(
--spectrum-global-color-static-blue-700
);--spectrum-semantic-informative-background-color-down:var(
--spectrum-global-color-static-blue-800
);--spectrum-semantic-informative-background-color-key-focus:var(
--spectrum-global-color-static-blue-700
);--spectrum-semantic-cta-background-color-default:var(
--spectrum-global-color-static-blue-600
);--spectrum-semantic-cta-background-color-hover:var(
--spectrum-global-color-static-blue-700
);--spectrum-semantic-cta-background-color-down:var(
--spectrum-global-color-static-blue-800
);--spectrum-semantic-cta-background-color-key-focus:var(
--spectrum-global-color-static-blue-700
);--spectrum-semantic-emphasized-border-color-default:var(
--spectrum-global-color-blue-500
);--spectrum-semantic-emphasized-border-color-hover:var(
--spectrum-global-color-blue-600
);--spectrum-semantic-emphasized-border-color-down:var(
--spectrum-global-color-blue-700
);--spectrum-semantic-emphasized-border-color-key-focus:var(
--spectrum-global-color-blue-600
);--spectrum-semantic-neutral-background-color-default:var(
--spectrum-global-color-static-gray-700
);--spectrum-semantic-neutral-background-color-hover:var(
--spectrum-global-color-static-gray-800
);--spectrum-semantic-neutral-background-color-down:var(
--spectrum-global-color-static-gray-900
);--spectrum-semantic-neutral-background-color-key-focus:var(
--spectrum-global-color-static-gray-800
);--spectrum-semantic-presence-color-1:var(
--spectrum-global-color-static-red-500
);--spectrum-semantic-presence-color-2:var(
--spectrum-global-color-static-orange-400
);--spectrum-semantic-presence-color-3:var(
--spectrum-global-color-static-yellow-400
);--spectrum-semantic-presence-color-4-rgb:75,204,162;--spectrum-semantic-presence-color-4:rgb(var(--spectrum-semantic-presence-color-4-rgb));--spectrum-semantic-presence-color-5-rgb:0,199,255;--spectrum-semantic-presence-color-5:rgb(var(--spectrum-semantic-presence-color-5-rgb));--spectrum-semantic-presence-color-6-rgb:0,140,184;--spectrum-semantic-presence-color-6:rgb(var(--spectrum-semantic-presence-color-6-rgb));--spectrum-semantic-presence-color-7-rgb:126,75,243;--spectrum-semantic-presence-color-7:rgb(var(--spectrum-semantic-presence-color-7-rgb));--spectrum-semantic-presence-color-8:var(
--spectrum-global-color-static-fuchsia-600
);--spectrum-global-dimension-static-percent-50:50%;--spectrum-global-dimension-static-percent-70:70%;--spectrum-global-dimension-static-percent-100:100%;--spectrum-global-dimension-static-breakpoint-xsmall:304px;--spectrum-global-dimension-static-breakpoint-small:768px;--spectrum-global-dimension-static-breakpoint-medium:1280px;--spectrum-global-dimension-static-breakpoint-large:1768px;--spectrum-global-dimension-static-breakpoint-xlarge:2160px;--spectrum-global-dimension-static-grid-columns:12;--spectrum-global-dimension-static-grid-fluid-width:100%;--spectrum-global-dimension-static-grid-fixed-max-width:1280px;--spectrum-global-dimension-static-size-0:0px;--spectrum-global-dimension-static-size-10:1px;--spectrum-global-dimension-static-size-25:2px;--spectrum-global-dimension-static-size-40:3px;--spectrum-global-dimension-static-size-50:4px;--spectrum-global-dimension-static-size-65:5px;--spectrum-global-dimension-static-size-75:6px;--spectrum-global-dimension-static-size-85:7px;--spectrum-global-dimension-static-size-100:8px;--spectrum-global-dimension-static-size-115:9px;--spectrum-global-dimension-static-size-125:10px;--spectrum-global-dimension-static-size-130:11px;--spectrum-global-dimension-static-size-150:12px;--spectrum-global-dimension-static-size-160:13px;--spectrum-global-dimension-static-size-175:14px;--spectrum-global-dimension-static-size-185:15px;--spectrum-global-dimension-static-size-200:16px;--spectrum-global-dimension-static-size-225:18px;--spectrum-global-dimension-static-size-250:20px;--spectrum-global-dimension-static-size-275:22px;--spectrum-global-dimension-static-size-300:24px;--spectrum-global-dimension-static-size-325:26px;--spectrum-global-dimension-static-size-350:28px;--spectrum-global-dimension-static-size-400:32px;--spectrum-global-dimension-static-size-450:36px;--spectrum-global-dimension-static-size-500:40px;--spectrum-global-dimension-static-size-550:44px;--spectrum-global-dimension-static-size-600:48px;--spectrum-global-dimension-static-size-700:56px;--spectrum-global-dimension-static-size-800:64px;--spectrum-global-dimension-static-size-900:72px;--spectrum-global-dimension-static-size-1000:80px;--spectrum-global-dimension-static-size-1200:96px;--spectrum-global-dimension-static-size-1700:136px;--spectrum-global-dimension-static-size-2400:192px;--spectrum-global-dimension-static-size-2500:200px;--spectrum-global-dimension-static-size-2600:208px;--spectrum-global-dimension-static-size-2800:224px;--spectrum-global-dimension-static-size-3200:256px;--spectrum-global-dimension-static-size-3400:272px;--spectrum-global-dimension-static-size-3500:280px;--spectrum-global-dimension-static-size-3600:288px;--spectrum-global-dimension-static-size-3800:304px;--spectrum-global-dimension-static-size-4600:368px;--spectrum-global-dimension-static-size-5000:400px;--spectrum-global-dimension-static-size-6000:480px;--spectrum-global-dimension-static-size-16000:1280px;--spectrum-global-dimension-static-font-size-50:11px;--spectrum-global-dimension-static-font-size-75:12px;--spectrum-global-dimension-static-font-size-100:14px;--spectrum-global-dimension-static-font-size-150:15px;--spectrum-global-dimension-static-font-size-200:16px;--spectrum-global-dimension-static-font-size-300:18px;--spectrum-global-dimension-static-font-size-400:20px;--spectrum-global-dimension-static-font-size-500:22px;--spectrum-global-dimension-static-font-size-600:25px;--spectrum-global-dimension-static-font-size-700:28px;--spectrum-global-dimension-static-font-size-800:32px;--spectrum-global-dimension-static-font-size-900:36px;--spectrum-global-dimension-static-font-size-1000:40px;--spectrum-global-font-family-base:adobe-clean,"Source Sans Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Trebuchet MS","Lucida Grande",sans-serif;--spectrum-global-font-family-serif:adobe-clean-serif,"Source Serif Pro",Georgia,serif;--spectrum-global-font-family-code:"Source Code Pro",Monaco,monospace;--spectrum-global-font-weight-thin:100;--spectrum-global-font-weight-ultra-light:200;--spectrum-global-font-weight-light:300;--spectrum-global-font-weight-regular:400;--spectrum-global-font-weight-medium:500;--spectrum-global-font-weight-semi-bold:600;--spectrum-global-font-weight-bold:700;--spectrum-global-font-weight-extra-bold:800;--spectrum-global-font-weight-black:900;--spectrum-global-font-style-regular:normal;--spectrum-global-font-style-italic:italic;--spectrum-global-font-letter-spacing-none:0;--spectrum-global-font-letter-spacing-small:0.0125em;--spectrum-global-font-letter-spacing-han:0.05em;--spectrum-global-font-letter-spacing-medium:0.06em;--spectrum-global-font-line-height-large:1.7;--spectrum-global-font-line-height-medium:1.5;--spectrum-global-font-line-height-small:1.3;--spectrum-global-font-multiplier-0:0em;--spectrum-global-font-multiplier-25:0.25em;--spectrum-global-font-multiplier-75:0.75em;--spectrum-global-font-font-family-ar:myriad-arabic,adobe-clean,"Source Sans Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Trebuchet MS","Lucida Grande",sans-serif;--spectrum-global-font-font-family-he:myriad-hebrew,adobe-clean,"Source Sans Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Trebuchet MS","Lucida Grande",sans-serif;--spectrum-global-font-font-family-zh:adobe-clean-han-traditional,source-han-traditional,"MingLiu","Heiti TC Light","sans-serif";--spectrum-global-font-font-family-zhhans:adobe-clean-han-simplified-c,source-han-simplified-c,"SimSun","Heiti SC Light","sans-serif";--spectrum-global-font-font-family-ko:adobe-clean-han-korean,source-han-korean,"Malgun Gothic","Apple Gothic","sans-serif";--spectrum-global-font-font-family-ja:adobe-clean-han-japanese,"Hiragino Kaku Gothic ProN","ヒラギノ角ゴ ProN W3","Osaka",YuGothic,"Yu Gothic","メイリオ",Meiryo,"ＭＳ Ｐゴシック","MS PGothic","sans-serif";--spectrum-global-font-font-family-condensed:adobe-clean-han-traditional,source-han-traditional,"MingLiu","Heiti TC Light",adobe-clean,"Source Sans Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Trebuchet MS","Lucida Grande",sans-serif;--spectrum-alias-loupe-entry-animation-duration:var(
--spectrum-global-animation-duration-300
);--spectrum-alias-loupe-exit-animation-duration:var(
--spectrum-global-animation-duration-300
);--spectrum-alias-heading-text-line-height:var(
--spectrum-global-font-line-height-small
);--spectrum-alias-heading-text-font-weight-regular:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-heading-text-font-weight-regular-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-heading-text-font-weight-light:var(
--spectrum-global-font-weight-light
);--spectrum-alias-heading-text-font-weight-light-strong:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-heading-text-font-weight-heavy:var(
--spectrum-global-font-weight-black
);--spectrum-alias-heading-text-font-weight-heavy-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-heading-text-font-weight-quiet:var(
--spectrum-global-font-weight-light
);--spectrum-alias-heading-text-font-weight-quiet-strong:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-heading-text-font-weight-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-heading-text-font-weight-strong-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-heading-margin-bottom:var(
--spectrum-global-font-multiplier-25
);--spectrum-alias-subheading-text-font-weight:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-subheading-text-font-weight-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-body-text-font-family:var(
--spectrum-global-font-family-base
);--spectrum-alias-body-text-line-height:var(
--spectrum-global-font-line-height-medium
);--spectrum-alias-body-text-font-weight:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-body-text-font-weight-strong:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-body-margin-bottom:var(
--spectrum-global-font-multiplier-75
);--spectrum-alias-detail-text-font-weight:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-detail-text-font-weight-regular:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-detail-text-font-weight-light:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-detail-text-font-weight-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-article-heading-text-font-weight:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-article-heading-text-font-weight-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-article-heading-text-font-weight-quiet:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-article-heading-text-font-weight-quiet-strong:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-article-body-text-font-weight:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-article-body-text-font-weight-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-article-subheading-text-font-weight:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-article-subheading-text-font-weight-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-article-detail-text-font-weight:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-article-detail-text-font-weight-strong:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-code-text-font-family:var(
--spectrum-global-font-family-code
);--spectrum-alias-code-text-font-weight-regular:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-code-text-font-weight-strong:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-code-text-line-height:var(
--spectrum-global-font-line-height-medium
);--spectrum-alias-code-margin-bottom:var(
--spectrum-global-font-multiplier-0
);--spectrum-alias-font-family-ar:var(--spectrum-global-font-font-family-ar);--spectrum-alias-font-family-he:var(--spectrum-global-font-font-family-he);--spectrum-alias-font-family-zh:var(--spectrum-global-font-font-family-zh);--spectrum-alias-font-family-zhhans:var(
--spectrum-global-font-font-family-zhhans
);--spectrum-alias-font-family-ko:var(--spectrum-global-font-font-family-ko);--spectrum-alias-font-family-ja:var(--spectrum-global-font-font-family-ja);--spectrum-alias-font-family-condensed:var(
--spectrum-global-font-font-family-condensed
);--spectrum-alias-component-text-line-height:var(
--spectrum-global-font-line-height-small
);--spectrum-alias-han-component-text-line-height:var(
--spectrum-global-font-line-height-medium
);--spectrum-alias-serif-text-font-family:var(
--spectrum-global-font-family-serif
);--spectrum-alias-han-heading-text-line-height:var(
--spectrum-global-font-line-height-medium
);--spectrum-alias-han-heading-text-font-weight-regular:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-han-heading-text-font-weight-regular-emphasis:var(
--spectrum-global-font-weight-extra-bold
);--spectrum-alias-han-heading-text-font-weight-regular-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-han-heading-text-font-weight-quiet-strong:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-han-heading-text-font-weight-light:var(
--spectrum-global-font-weight-light
);--spectrum-alias-han-heading-text-font-weight-light-emphasis:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-han-heading-text-font-weight-light-strong:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-han-heading-text-font-weight-heavy:var(
--spectrum-global-font-weight-black
);--spectrum-alias-han-heading-text-font-weight-heavy-emphasis:var(
--spectrum-global-font-weight-black
);--spectrum-alias-han-heading-text-font-weight-heavy-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-han-body-text-line-height:var(
--spectrum-global-font-line-height-large
);--spectrum-alias-han-body-text-font-weight-regular:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-han-body-text-font-weight-emphasis:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-han-body-text-font-weight-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-han-subheading-text-font-weight-regular:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-han-subheading-text-font-weight-emphasis:var(
--spectrum-global-font-weight-extra-bold
);--spectrum-alias-han-subheading-text-font-weight-strong:var(
--spectrum-global-font-weight-black
);--spectrum-alias-han-detail-text-font-weight:var(
--spectrum-global-font-weight-regular
);--spectrum-alias-han-detail-text-font-weight-emphasis:var(
--spectrum-global-font-weight-bold
);--spectrum-alias-han-detail-text-font-weight-strong:var(
--spectrum-global-font-weight-black
)}:host,:root{--spectrum-alias-item-height-s:var(--spectrum-global-dimension-size-300);--spectrum-alias-item-height-m:var(--spectrum-global-dimension-size-400);--spectrum-alias-item-height-l:var(--spectrum-global-dimension-size-500);--spectrum-alias-item-height-xl:var(--spectrum-global-dimension-size-600);--spectrum-alias-item-rounded-border-radius-s:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-item-rounded-border-radius-m:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-item-rounded-border-radius-l:var(
--spectrum-global-dimension-size-250
);--spectrum-alias-item-rounded-border-radius-xl:var(
--spectrum-global-dimension-size-300
);--spectrum-alias-item-text-size-s:var(
--spectrum-global-dimension-font-size-75
);--spectrum-alias-item-text-size-m:var(
--spectrum-global-dimension-font-size-100
);--spectrum-alias-item-text-size-l:var(
--spectrum-global-dimension-font-size-200
);--spectrum-alias-item-text-size-xl:var(
--spectrum-global-dimension-font-size-300
);--spectrum-alias-item-text-padding-top-s:var(
--spectrum-global-dimension-static-size-50
);--spectrum-alias-item-text-padding-top-m:var(
--spectrum-global-dimension-size-75
);--spectrum-alias-item-text-padding-top-xl:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-item-text-padding-bottom-m:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-text-padding-bottom-l:var(
--spectrum-global-dimension-size-130
);--spectrum-alias-item-text-padding-bottom-xl:var(
--spectrum-global-dimension-size-175
);--spectrum-alias-item-icon-padding-top-s:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-item-icon-padding-top-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-icon-padding-top-l:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-icon-padding-top-xl:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-item-icon-padding-bottom-s:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-item-icon-padding-bottom-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-icon-padding-bottom-l:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-icon-padding-bottom-xl:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-item-padding-s:var(--spectrum-global-dimension-size-115);--spectrum-alias-item-padding-m:var(--spectrum-global-dimension-size-150);--spectrum-alias-item-padding-l:var(--spectrum-global-dimension-size-185);--spectrum-alias-item-padding-xl:var(--spectrum-global-dimension-size-225);--spectrum-alias-item-rounded-padding-s:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-item-rounded-padding-m:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-item-rounded-padding-l:var(
--spectrum-global-dimension-size-250
);--spectrum-alias-item-rounded-padding-xl:var(
--spectrum-global-dimension-size-300
);--spectrum-alias-item-icononly-padding-s:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-item-icononly-padding-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-icononly-padding-l:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-icononly-padding-xl:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-item-control-gap-s:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-control-gap-m:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-control-gap-l:var(
--spectrum-global-dimension-size-130
);--spectrum-alias-item-control-gap-xl:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-item-workflow-icon-gap-s:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-workflow-icon-gap-m:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-item-workflow-icon-gap-l:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-workflow-icon-gap-xl:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-mark-gap-s:var(--spectrum-global-dimension-size-85);--spectrum-alias-item-mark-gap-m:var(--spectrum-global-dimension-size-100);--spectrum-alias-item-mark-gap-l:var(--spectrum-global-dimension-size-115);--spectrum-alias-item-mark-gap-xl:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-ui-icon-gap-s:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-ui-icon-gap-m:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-item-ui-icon-gap-l:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-ui-icon-gap-xl:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-clearbutton-gap-s:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-item-clearbutton-gap-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-clearbutton-gap-l:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-clearbutton-gap-xl:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-item-workflow-padding-left-s:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-workflow-padding-left-l:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-item-workflow-padding-left-xl:var(
--spectrum-global-dimension-size-185
);--spectrum-alias-item-rounded-workflow-padding-left-s:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-rounded-workflow-padding-left-l:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-item-mark-padding-top-s:var(
--spectrum-global-dimension-size-40
);--spectrum-alias-item-mark-padding-top-l:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-mark-padding-top-xl:var(
--spectrum-global-dimension-size-130
);--spectrum-alias-item-mark-padding-bottom-s:var(
--spectrum-global-dimension-size-40
);--spectrum-alias-item-mark-padding-bottom-l:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-mark-padding-bottom-xl:var(
--spectrum-global-dimension-size-130
);--spectrum-alias-item-mark-padding-left-s:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-mark-padding-left-l:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-item-mark-padding-left-xl:var(
--spectrum-global-dimension-size-185
);--spectrum-alias-item-control-1-size-s:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-item-control-1-size-m:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-item-control-2-size-m:var(
--spectrum-global-dimension-size-175
);--spectrum-alias-item-control-2-size-l:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-item-control-2-size-xl:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-item-control-2-size-xxl:var(
--spectrum-global-dimension-size-250
);--spectrum-alias-item-control-2-border-radius-s:var(
--spectrum-global-dimension-size-75
);--spectrum-alias-item-control-2-border-radius-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-control-2-border-radius-l:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-item-control-2-border-radius-xl:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-control-2-border-radius-xxl:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-control-2-padding-s:var(
--spectrum-global-dimension-size-75
);--spectrum-alias-item-control-2-padding-m:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-control-2-padding-l:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-item-control-2-padding-xl:var(
--spectrum-global-dimension-size-185
);--spectrum-alias-item-control-3-height-m:var(
--spectrum-global-dimension-size-175
);--spectrum-alias-item-control-3-height-l:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-item-control-3-height-xl:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-item-control-3-border-radius-s:var(
--spectrum-global-dimension-size-75
);--spectrum-alias-item-control-3-border-radius-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-item-control-3-border-radius-l:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-item-control-3-border-radius-xl:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-control-3-padding-s:var(
--spectrum-global-dimension-size-75
);--spectrum-alias-item-control-3-padding-m:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-control-3-padding-l:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-item-control-3-padding-xl:var(
--spectrum-global-dimension-size-185
);--spectrum-alias-item-mark-size-s:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-item-mark-size-l:var(
--spectrum-global-dimension-size-275
);--spectrum-alias-item-mark-size-xl:var(
--spectrum-global-dimension-size-325
);--spectrum-alias-heading-xxxl-text-size:var(
--spectrum-global-dimension-font-size-1300
);--spectrum-alias-heading-xxl-text-size:var(
--spectrum-global-dimension-font-size-1100
);--spectrum-alias-heading-xl-text-size:var(
--spectrum-global-dimension-font-size-900
);--spectrum-alias-heading-l-text-size:var(
--spectrum-global-dimension-font-size-700
);--spectrum-alias-heading-m-text-size:var(
--spectrum-global-dimension-font-size-500
);--spectrum-alias-heading-s-text-size:var(
--spectrum-global-dimension-font-size-300
);--spectrum-alias-heading-xs-text-size:var(
--spectrum-global-dimension-font-size-200
);--spectrum-alias-heading-xxs-text-size:var(
--spectrum-global-dimension-font-size-100
);--spectrum-alias-heading-xxxl-margin-top:var(
--spectrum-global-dimension-font-size-1200
);--spectrum-alias-heading-xxl-margin-top:var(
--spectrum-global-dimension-font-size-900
);--spectrum-alias-heading-xl-margin-top:var(
--spectrum-global-dimension-font-size-800
);--spectrum-alias-heading-l-margin-top:var(
--spectrum-global-dimension-font-size-600
);--spectrum-alias-heading-m-margin-top:var(
--spectrum-global-dimension-font-size-400
);--spectrum-alias-heading-s-margin-top:var(
--spectrum-global-dimension-font-size-200
);--spectrum-alias-heading-xs-margin-top:var(
--spectrum-global-dimension-font-size-100
);--spectrum-alias-heading-xxs-margin-top:var(
--spectrum-global-dimension-font-size-75
);--spectrum-alias-heading-han-xxxl-text-size:var(
--spectrum-global-dimension-font-size-1300
);--spectrum-alias-heading-han-xxl-text-size:var(
--spectrum-global-dimension-font-size-900
);--spectrum-alias-heading-han-xl-text-size:var(
--spectrum-global-dimension-font-size-800
);--spectrum-alias-heading-han-l-text-size:var(
--spectrum-global-dimension-font-size-600
);--spectrum-alias-heading-han-m-text-size:var(
--spectrum-global-dimension-font-size-400
);--spectrum-alias-heading-han-s-text-size:var(
--spectrum-global-dimension-font-size-300
);--spectrum-alias-heading-han-xs-text-size:var(
--spectrum-global-dimension-font-size-200
);--spectrum-alias-heading-han-xxs-text-size:var(
--spectrum-global-dimension-font-size-100
);--spectrum-alias-heading-han-xxxl-margin-top:var(
--spectrum-global-dimension-font-size-1200
);--spectrum-alias-heading-han-xxl-margin-top:var(
--spectrum-global-dimension-font-size-800
);--spectrum-alias-heading-han-xl-margin-top:var(
--spectrum-global-dimension-font-size-700
);--spectrum-alias-heading-han-l-margin-top:var(
--spectrum-global-dimension-font-size-500
);--spectrum-alias-heading-han-m-margin-top:var(
--spectrum-global-dimension-font-size-300
);--spectrum-alias-heading-han-s-margin-top:var(
--spectrum-global-dimension-font-size-200
);--spectrum-alias-heading-han-xs-margin-top:var(
--spectrum-global-dimension-font-size-100
);--spectrum-alias-heading-han-xxs-margin-top:var(
--spectrum-global-dimension-font-size-75
);--spectrum-alias-component-border-radius:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-component-border-radius-quiet:var(
--spectrum-global-dimension-static-size-0
);--spectrum-alias-component-focusring-gap:var(
--spectrum-global-dimension-static-size-0
);--spectrum-alias-component-focusring-gap-emphasized:var(
--spectrum-global-dimension-static-size-25
);--spectrum-alias-component-focusring-size:var(
--spectrum-global-dimension-static-size-10
);--spectrum-alias-component-focusring-size-emphasized:var(
--spectrum-global-dimension-static-size-25
);--spectrum-alias-input-border-size:var(
--spectrum-global-dimension-static-size-10
);--spectrum-alias-input-focusring-gap:var(
--spectrum-global-dimension-static-size-0
);--spectrum-alias-input-quiet-focusline-gap:var(
--spectrum-global-dimension-static-size-10
);--spectrum-alias-control-two-size-m:var(
--spectrum-global-dimension-size-175
);--spectrum-alias-control-two-size-l:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-control-two-size-xl:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-control-two-size-xxl:var(
--spectrum-global-dimension-size-250
);--spectrum-alias-control-two-border-radius-s:var(
--spectrum-global-dimension-size-75
);--spectrum-alias-control-two-border-radius-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-control-two-border-radius-l:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-control-two-border-radius-xl:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-control-two-border-radius-xxl:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-control-two-focus-ring-border-radius-s:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-control-two-focus-ring-border-radius-m:var(
--spectrum-global-dimension-size-130
);--spectrum-alias-control-two-focus-ring-border-radius-l:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-control-two-focus-ring-border-radius-xl:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-control-two-focus-ring-border-radius-xxl:var(
--spectrum-global-dimension-size-175
);--spectrum-alias-control-three-height-m:var(
--spectrum-global-dimension-size-175
);--spectrum-alias-control-three-height-l:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-control-three-height-xl:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-infieldbutton-icon-margin-y-s:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-infieldbutton-icon-margin-y-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-infieldbutton-icon-margin-y-l:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-infieldbutton-icon-margin-y-xl:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-infieldbutton-border-radius:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-infieldbutton-border-radius-sided:0;--spectrum-alias-infieldbutton-border-size:var(
--spectrum-global-dimension-static-size-10
);--spectrum-alias-infieldbutton-fill-padding-s:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-infieldbutton-fill-padding-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-infieldbutton-fill-padding-l:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-infieldbutton-fill-padding-xl:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-infieldbutton-padding-s:0;--spectrum-alias-infieldbutton-padding-m:0;--spectrum-alias-infieldbutton-padding-l:0;--spectrum-alias-infieldbutton-padding-xl:0;--spectrum-alias-infieldbutton-full-height-s:var(
--spectrum-global-dimension-size-300
);--spectrum-alias-infieldbutton-full-height-m:var(
--spectrum-global-dimension-size-400
);--spectrum-alias-infieldbutton-full-height-l:var(
--spectrum-global-dimension-size-500
);--spectrum-alias-infieldbutton-full-height-xl:var(
--spectrum-global-dimension-size-600
);--spectrum-alias-infieldbutton-half-height-s:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-infieldbutton-half-height-m:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-infieldbutton-half-height-l:var(
--spectrum-global-dimension-size-250
);--spectrum-alias-infieldbutton-half-height-xl:var(
--spectrum-global-dimension-size-300
);--spectrum-alias-stepperbutton-gap:0;--spectrum-alias-stepperbutton-width-s:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-stepperbutton-width-m:var(
--spectrum-global-dimension-size-300
);--spectrum-alias-stepperbutton-width-l:var(
--spectrum-global-dimension-size-400
);--spectrum-alias-stepperbutton-width-xl:var(
--spectrum-global-dimension-size-450
);--spectrum-alias-stepperbutton-icon-x-offset-s:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-stepperbutton-icon-x-offset-m:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-stepperbutton-icon-x-offset-l:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-stepperbutton-icon-x-offset-xl:var(
--spectrum-global-dimension-size-130
);--spectrum-alias-stepperbutton-icon-y-offset-top-s:var(
--spectrum-global-dimension-size-25
);--spectrum-alias-stepperbutton-icon-y-offset-top-m:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-stepperbutton-icon-y-offset-top-l:var(
--spectrum-global-dimension-size-65
);--spectrum-alias-stepperbutton-icon-y-offset-top-xl:var(
--spectrum-global-dimension-size-75
);--spectrum-alias-stepperbutton-icon-y-offset-bottom-s:var(
--spectrum-global-dimension-size-10
);--spectrum-alias-stepperbutton-icon-y-offset-bottom-m:var(
--spectrum-global-dimension-size-25
);--spectrum-alias-stepperbutton-icon-y-offset-bottom-l:var(
--spectrum-global-dimension-size-40
);--spectrum-alias-stepperbutton-icon-y-offset-bottom-xl:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-stepperbutton-radius-touching:0;--spectrum-alias-clearbutton-icon-margin-s:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-clearbutton-icon-margin-m:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-clearbutton-icon-margin-l:var(
--spectrum-global-dimension-size-185
);--spectrum-alias-clearbutton-icon-margin-xl:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-clearbutton-border-radius:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-search-border-radius:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-search-border-radius-quiet:0;--spectrum-alias-combobox-quiet-button-offset-x:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-thumbnail-border-radius-small:var(
--spectrum-global-dimension-size-25
);--spectrum-alias-search-padding-left-s:var(
--spectrum-global-dimension-size-85
);--spectrum-alias-search-padding-left-l:var(
--spectrum-global-dimension-size-160
);--spectrum-alias-search-padding-left-xl:var(
--spectrum-global-dimension-size-185
);--spectrum-alias-percent-50:50%;--spectrum-alias-percent-70:70%;--spectrum-alias-percent-100:100%;--spectrum-alias-breakpoint-xsmall:304px;--spectrum-alias-breakpoint-small:768px;--spectrum-alias-breakpoint-medium:1280px;--spectrum-alias-breakpoint-large:1768px;--spectrum-alias-breakpoint-xlarge:2160px;--spectrum-alias-grid-columns:12;--spectrum-alias-grid-fluid-width:100%;--spectrum-alias-grid-fixed-max-width:1280px;--spectrum-alias-border-size-thin:var(
--spectrum-global-dimension-static-size-10
);--spectrum-alias-border-size-thick:var(
--spectrum-global-dimension-static-size-25
);--spectrum-alias-border-size-thicker:var(
--spectrum-global-dimension-static-size-50
);--spectrum-alias-border-size-thickest:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-border-offset-thin:var(
--spectrum-global-dimension-static-size-25
);--spectrum-alias-border-offset-thick:var(
--spectrum-global-dimension-static-size-50
);--spectrum-alias-border-offset-thicker:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-border-offset-thickest:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-grid-baseline:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-grid-gutter-xsmall:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-grid-gutter-small:var(
--spectrum-global-dimension-static-size-300
);--spectrum-alias-grid-gutter-medium:var(
--spectrum-global-dimension-static-size-400
);--spectrum-alias-grid-gutter-large:var(
--spectrum-global-dimension-static-size-500
);--spectrum-alias-grid-gutter-xlarge:var(
--spectrum-global-dimension-static-size-600
);--spectrum-alias-grid-margin-xsmall:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-grid-margin-small:var(
--spectrum-global-dimension-static-size-300
);--spectrum-alias-grid-margin-medium:var(
--spectrum-global-dimension-static-size-400
);--spectrum-alias-grid-margin-large:var(
--spectrum-global-dimension-static-size-500
);--spectrum-alias-grid-margin-xlarge:var(
--spectrum-global-dimension-static-size-600
);--spectrum-alias-grid-layout-region-margin-bottom-xsmall:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-grid-layout-region-margin-bottom-small:var(
--spectrum-global-dimension-static-size-300
);--spectrum-alias-grid-layout-region-margin-bottom-medium:var(
--spectrum-global-dimension-static-size-400
);--spectrum-alias-grid-layout-region-margin-bottom-large:var(
--spectrum-global-dimension-static-size-500
);--spectrum-alias-grid-layout-region-margin-bottom-xlarge:var(
--spectrum-global-dimension-static-size-600
);--spectrum-alias-radial-reaction-size-default:var(
--spectrum-global-dimension-static-size-550
);--spectrum-alias-focus-ring-gap:var(
--spectrum-global-dimension-static-size-25
);--spectrum-alias-focus-ring-size:var(
--spectrum-global-dimension-static-size-25
);--spectrum-alias-focus-ring-gap-small:var(
--spectrum-global-dimension-static-size-0
);--spectrum-alias-focus-ring-size-small:var(
--spectrum-global-dimension-static-size-10
);--spectrum-alias-dropshadow-blur:var(--spectrum-global-dimension-size-50);--spectrum-alias-dropshadow-offset-y:var(
--spectrum-global-dimension-size-10
);--spectrum-alias-font-size-default:var(
--spectrum-global-dimension-font-size-100
);--spectrum-alias-layout-label-gap-size:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-pill-button-text-size:var(
--spectrum-global-dimension-font-size-100
);--spectrum-alias-pill-button-text-baseline:var(
--spectrum-global-dimension-static-size-150
);--spectrum-alias-border-radius-xsmall:var(
--spectrum-global-dimension-size-10
);--spectrum-alias-border-radius-small:var(
--spectrum-global-dimension-size-25
);--spectrum-alias-border-radius-regular:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-border-radius-medium:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-border-radius-large:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-border-radius-xlarge:var(
--spectrum-global-dimension-size-300
);--spectrum-alias-focus-ring-border-radius-xsmall:var(
--spectrum-global-dimension-size-50
);--spectrum-alias-focus-ring-border-radius-small:var(
--spectrum-global-dimension-static-size-65
);--spectrum-alias-focus-ring-border-radius-medium:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-focus-ring-border-radius-large:var(
--spectrum-global-dimension-size-250
);--spectrum-alias-focus-ring-border-radius-xlarge:var(
--spectrum-global-dimension-size-350
);--spectrum-alias-single-line-height:var(
--spectrum-global-dimension-size-400
);--spectrum-alias-single-line-width:var(
--spectrum-global-dimension-size-2400
);--spectrum-alias-workflow-icon-size-s:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-workflow-icon-size-m:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-workflow-icon-size-xl:var(
--spectrum-global-dimension-size-275
);--spectrum-alias-ui-icon-alert-size-75:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-ui-icon-alert-size-100:var(
--spectrum-global-dimension-size-225
);--spectrum-alias-ui-icon-alert-size-200:var(
--spectrum-global-dimension-size-250
);--spectrum-alias-ui-icon-alert-size-300:var(
--spectrum-global-dimension-size-275
);--spectrum-alias-ui-icon-triplegripper-size-100-height:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-ui-icon-doublegripper-size-100-width:var(
--spectrum-global-dimension-size-200
);--spectrum-alias-ui-icon-singlegripper-size-100-width:var(
--spectrum-global-dimension-size-300
);--spectrum-alias-ui-icon-cornertriangle-size-75:var(
--spectrum-global-dimension-size-65
);--spectrum-alias-ui-icon-cornertriangle-size-200:var(
--spectrum-global-dimension-size-75
);--spectrum-alias-ui-icon-asterisk-size-75:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-ui-icon-asterisk-size-100:var(
--spectrum-global-dimension-size-100
);--spectrum-alias-colorloupe-width:var(
--spectrum-global-dimension-static-size-600
);--spectrum-alias-colorloupe-height:var(
--spectrum-global-dimension-static-size-800
)}:host,:root{--spectrum-alias-colorhandle-outer-border-color:rgba(0,0,0,.42);--spectrum-alias-transparent-blue-background-color-hover:rgba(0,87,190,.15);--spectrum-alias-transparent-blue-background-color-down:rgba(0,72,153,.3);--spectrum-alias-transparent-blue-background-color-key-focus:var(
--spectrum-alias-transparent-blue-background-color-hover
);--spectrum-alias-transparent-blue-background-color-mouse-focus:var(
--spectrum-alias-transparent-blue-background-color-hover
);--spectrum-alias-transparent-blue-background-color:var(
--spectrum-alias-component-text-color-default
);--spectrum-alias-transparent-red-background-color-hover:rgba(154,0,0,.15);--spectrum-alias-transparent-red-background-color-down:rgba(124,0,0,.3);--spectrum-alias-transparent-red-background-color-key-focus:var(
--spectrum-alias-transparent-red-background-color-hover
);--spectrum-alias-transparent-red-background-color-mouse-focus:var(
--spectrum-alias-transparent-red-background-color-hover
);--spectrum-alias-transparent-red-background-color:var(
--spectrum-alias-component-text-color-default
);--spectrum-alias-component-text-color-disabled:var(
--spectrum-global-color-gray-500
);--spectrum-alias-component-text-color-default:var(
--spectrum-global-color-gray-800
);--spectrum-alias-component-text-color-hover:var(
--spectrum-global-color-gray-900
);--spectrum-alias-component-text-color-down:var(
--spectrum-global-color-gray-900
);--spectrum-alias-component-text-color-key-focus:var(
--spectrum-alias-component-text-color-hover
);--spectrum-alias-component-text-color-mouse-focus:var(
--spectrum-alias-component-text-color-hover
);--spectrum-alias-component-text-color:var(
--spectrum-alias-component-text-color-default
);--spectrum-alias-component-text-color-selected-default:var(
--spectrum-alias-component-text-color-default
);--spectrum-alias-component-text-color-selected-hover:var(
--spectrum-alias-component-text-color-hover
);--spectrum-alias-component-text-color-selected-down:var(
--spectrum-alias-component-text-color-down
);--spectrum-alias-component-text-color-selected-key-focus:var(
--spectrum-alias-component-text-color-key-focus
);--spectrum-alias-component-text-color-selected-mouse-focus:var(
--spectrum-alias-component-text-color-mouse-focus
);--spectrum-alias-component-text-color-selected:var(
--spectrum-alias-component-text-color-selected-default
);--spectrum-alias-component-text-color-emphasized-selected-default:var(
--spectrum-global-color-static-white
);--spectrum-alias-component-text-color-emphasized-selected-hover:var(
--spectrum-alias-component-text-color-emphasized-selected-default
);--spectrum-alias-component-text-color-emphasized-selected-down:var(
--spectrum-alias-component-text-color-emphasized-selected-default
);--spectrum-alias-component-text-color-emphasized-selected-key-focus:var(
--spectrum-alias-component-text-color-emphasized-selected-default
);--spectrum-alias-component-text-color-emphasized-selected-mouse-focus:var(
--spectrum-alias-component-text-color-emphasized-selected-default
);--spectrum-alias-component-text-color-emphasized-selected:var(
--spectrum-alias-component-text-color-emphasized-selected-default
);--spectrum-alias-component-text-color-error-default:var(
--spectrum-semantic-negative-text-color-small
);--spectrum-alias-component-text-color-error-hover:var(
--spectrum-semantic-negative-text-color-small-hover
);--spectrum-alias-component-text-color-error-down:var(
--spectrum-semantic-negative-text-color-small-down
);--spectrum-alias-component-text-color-error-key-focus:var(
--spectrum-semantic-negative-text-color-small-key-focus
);--spectrum-alias-component-text-color-error-mouse-focus:var(
--spectrum-semantic-negative-text-color-small-key-focus
);--spectrum-alias-component-text-color-error:var(
--spectrum-alias-component-text-color-error-default
);--spectrum-alias-component-icon-color-disabled:var(
--spectrum-alias-icon-color-disabled
);--spectrum-alias-component-icon-color-default:var(
--spectrum-alias-icon-color
);--spectrum-alias-component-icon-color-hover:var(
--spectrum-alias-icon-color-hover
);--spectrum-alias-component-icon-color-down:var(
--spectrum-alias-icon-color-down
);--spectrum-alias-component-icon-color-key-focus:var(
--spectrum-alias-icon-color-hover
);--spectrum-alias-component-icon-color-mouse-focus:var(
--spectrum-alias-icon-color-down
);--spectrum-alias-component-icon-color:var(
--spectrum-alias-component-icon-color-default
);--spectrum-alias-component-icon-color-selected:var(
--spectrum-alias-icon-color-selected-neutral-subdued
);--spectrum-alias-component-icon-color-emphasized-selected-default:var(
--spectrum-global-color-static-white
);--spectrum-alias-component-icon-color-emphasized-selected-hover:var(
--spectrum-alias-component-icon-color-emphasized-selected-default
);--spectrum-alias-component-icon-color-emphasized-selected-down:var(
--spectrum-alias-component-icon-color-emphasized-selected-default
);--spectrum-alias-component-icon-color-emphasized-selected-key-focus:var(
--spectrum-alias-component-icon-color-emphasized-selected-default
);--spectrum-alias-component-icon-color-emphasized-selected:var(
--spectrum-alias-component-icon-color-emphasized-selected-default
);--spectrum-alias-component-background-color-disabled:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-background-color-quiet-disabled:var(
--spectrum-alias-background-color-transparent
);--spectrum-alias-component-background-color-quiet-selected-disabled:var(
--spectrum-alias-component-background-color-disabled
);--spectrum-alias-component-background-color-default:var(
--spectrum-global-color-gray-75
);--spectrum-alias-component-background-color-hover:var(
--spectrum-global-color-gray-50
);--spectrum-alias-component-background-color-down:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-background-color-key-focus:var(
--spectrum-global-color-gray-50
);--spectrum-alias-component-background-color:var(
--spectrum-alias-component-background-color-default
);--spectrum-alias-component-background-color-selected-default:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-background-color-selected-hover:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-background-color-selected-down:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-background-color-selected-key-focus:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-background-color-selected:var(
--spectrum-alias-component-background-color-selected-default
);--spectrum-alias-component-background-color-quiet-default:var(
--spectrum-alias-background-color-transparent
);--spectrum-alias-component-background-color-quiet-hover:var(
--spectrum-alias-background-color-transparent
);--spectrum-alias-component-background-color-quiet-down:var(
--spectrum-global-color-gray-300
);--spectrum-alias-component-background-color-quiet-key-focus:var(
--spectrum-alias-background-color-transparent
);--spectrum-alias-component-background-color-quiet:var(
--spectrum-alias-component-background-color-quiet-default
);--spectrum-alias-component-background-color-quiet-selected-default:var(
--spectrum-alias-component-background-color-selected-default
);--spectrum-alias-component-background-color-quiet-selected-hover:var(
--spectrum-alias-component-background-color-selected-hover
);--spectrum-alias-component-background-color-quiet-selected-down:var(
--spectrum-alias-component-background-color-selected-down
);--spectrum-alias-component-background-color-quiet-selected-key-focus:var(
--spectrum-alias-component-background-color-selected-key-focus
);--spectrum-alias-component-background-color-quiet-selected:var(
--spectrum-alias-component-background-color-selected-default
);--spectrum-alias-component-background-color-emphasized-selected-default:var(
--spectrum-semantic-cta-background-color-default
);--spectrum-alias-component-background-color-emphasized-selected-hover:var(
--spectrum-semantic-cta-background-color-hover
);--spectrum-alias-component-background-color-emphasized-selected-down:var(
--spectrum-semantic-cta-background-color-down
);--spectrum-alias-component-background-color-emphasized-selected-key-focus:var(
--spectrum-semantic-cta-background-color-key-focus
);--spectrum-alias-component-background-color-emphasized-selected:var(
--spectrum-alias-component-background-color-emphasized-selected-default
);--spectrum-alias-component-border-color-disabled:var(
--spectrum-alias-border-color-disabled
);--spectrum-alias-component-border-color-quiet-disabled:var(
--spectrum-alias-border-color-transparent
);--spectrum-alias-component-border-color-default:var(
--spectrum-alias-border-color
);--spectrum-alias-component-border-color-hover:var(
--spectrum-alias-border-color-hover
);--spectrum-alias-component-border-color-down:var(
--spectrum-alias-border-color-down
);--spectrum-alias-component-border-color-key-focus:var(
--spectrum-alias-border-color-key-focus
);--spectrum-alias-component-border-color:var(
--spectrum-alias-component-border-color-default
);--spectrum-alias-component-border-color-selected-default:var(
--spectrum-alias-border-color
);--spectrum-alias-component-border-color-selected-hover:var(
--spectrum-alias-border-color-hover
);--spectrum-alias-component-border-color-selected-down:var(
--spectrum-alias-border-color-down
);--spectrum-alias-component-border-color-selected-key-focus:var(
--spectrum-alias-border-color-key-focus
);--spectrum-alias-component-border-color-selected:var(
--spectrum-alias-component-border-color-selected-default
);--spectrum-alias-component-border-color-quiet-default:var(
--spectrum-alias-border-color-transparent
);--spectrum-alias-component-border-color-quiet-hover:var(
--spectrum-alias-border-color-transparent
);--spectrum-alias-component-border-color-quiet-down:var(
--spectrum-alias-border-color-transparent
);--spectrum-alias-component-border-color-quiet-key-focus:var(
--spectrum-alias-border-color-key-focus
);--spectrum-alias-component-border-color-quiet:var(
--spectrum-alias-component-border-color-quiet-default
);--spectrum-alias-component-border-color-quiet-selected-default:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-border-color-quiet-selected-hover:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-border-color-quiet-selected-down:var(
--spectrum-global-color-gray-200
);--spectrum-alias-component-border-color-quiet-selected-key-focus:var(
--spectrum-alias-border-color-key-focus
);--spectrum-alias-component-border-color-quiet-selected:var(
--spectrum-alias-component-border-color-quiet-selected-default
);--spectrum-alias-component-border-color-emphasized-selected-default:var(
--spectrum-semantic-cta-background-color-default
);--spectrum-alias-component-border-color-emphasized-selected-hover:var(
--spectrum-semantic-cta-background-color-hover
);--spectrum-alias-component-border-color-emphasized-selected-down:var(
--spectrum-semantic-cta-background-color-down
);--spectrum-alias-component-border-color-emphasized-selected-key-focus:var(
--spectrum-semantic-cta-background-color-key-focus
);--spectrum-alias-component-border-color-emphasized-selected:var(
--spectrum-alias-component-border-color-emphasized-selected-default
);--spectrum-alias-toggle-background-color-default:var(
--spectrum-global-color-gray-700
);--spectrum-alias-toggle-background-color-hover:var(
--spectrum-global-color-gray-800
);--spectrum-alias-toggle-background-color-down:var(
--spectrum-global-color-gray-900
);--spectrum-alias-toggle-background-color-key-focus:var(
--spectrum-global-color-gray-800
);--spectrum-alias-toggle-background-color:var(
--spectrum-alias-toggle-background-color-default
);--spectrum-alias-toggle-background-color-emphasized-selected-default:var(
--spectrum-global-color-blue-500
);--spectrum-alias-toggle-background-color-emphasized-selected-hover:var(
--spectrum-global-color-blue-600
);--spectrum-alias-toggle-background-color-emphasized-selected-down:var(
--spectrum-global-color-blue-700
);--spectrum-alias-toggle-background-color-emphasized-selected-key-focus:var(
--spectrum-global-color-blue-600
);--spectrum-alias-toggle-background-color-emphasized-selected:var(
--spectrum-alias-toggle-background-color-emphasized-selected-default
);--spectrum-alias-toggle-border-color-default:var(
--spectrum-global-color-gray-700
);--spectrum-alias-toggle-border-color-hover:var(
--spectrum-global-color-gray-800
);--spectrum-alias-toggle-border-color-down:var(
--spectrum-global-color-gray-900
);--spectrum-alias-toggle-border-color-key-focus:var(
--spectrum-global-color-gray-800
);--spectrum-alias-toggle-border-color:var(
--spectrum-alias-toggle-border-color-default
);--spectrum-alias-toggle-icon-color-selected:var(
--spectrum-global-color-gray-75
);--spectrum-alias-toggle-icon-color-emphasized-selected:var(
--spectrum-global-color-gray-75
);--spectrum-alias-input-border-color-disabled:var(
--spectrum-alias-border-color-transparent
);--spectrum-alias-input-border-color-quiet-disabled:var(
--spectrum-alias-border-color-mid
);--spectrum-alias-input-border-color-default:var(
--spectrum-alias-border-color
);--spectrum-alias-input-border-color-hover:var(
--spectrum-alias-border-color-hover
);--spectrum-alias-input-border-color-down:var(
--spectrum-alias-border-color-mouse-focus
);--spectrum-alias-input-border-color-mouse-focus:var(
--spectrum-alias-border-color-mouse-focus
);--spectrum-alias-input-border-color-key-focus:var(
--spectrum-alias-border-color-key-focus
);--spectrum-alias-input-border-color:var(
--spectrum-alias-input-border-color-default
);--spectrum-alias-input-border-color-invalid-default:var(
--spectrum-semantic-negative-color-default
);--spectrum-alias-input-border-color-invalid-hover:var(
--spectrum-semantic-negative-color-hover
);--spectrum-alias-input-border-color-invalid-down:var(
--spectrum-semantic-negative-color-down
);--spectrum-alias-input-border-color-invalid-mouse-focus:var(
--spectrum-semantic-negative-color-hover
);--spectrum-alias-input-border-color-invalid-key-focus:var(
--spectrum-alias-border-color-key-focus
);--spectrum-alias-input-border-color-invalid:var(
--spectrum-alias-input-border-color-invalid-default
);--spectrum-alias-background-color-yellow-default:var(
--spectrum-global-color-static-yellow-300
);--spectrum-alias-background-color-yellow-hover:var(
--spectrum-global-color-static-yellow-400
);--spectrum-alias-background-color-yellow-key-focus:var(
--spectrum-global-color-static-yellow-400
);--spectrum-alias-background-color-yellow-down:var(
--spectrum-global-color-static-yellow-500
);--spectrum-alias-background-color-yellow:var(
--spectrum-alias-background-color-yellow-default
);--spectrum-alias-infieldbutton-background-color:var(
--spectrum-global-color-gray-200
);--spectrum-alias-infieldbutton-fill-loudnessLow-border-color-disabled:transparent;--spectrum-alias-infieldbutton-fill-loudnessMedium-border-color-disabled:transparent;--spectrum-alias-infieldbutton-fill-loudnessHigh-border-color-disabled:var(
--spectrum-alias-component-background-color-disabled
);--spectrum-alias-infieldbutton-fill-border-color-default:var(
--spectrum-alias-input-border-color-default
);--spectrum-alias-infieldbutton-fill-border-color-hover:var(
--spectrum-alias-input-border-color-hover
);--spectrum-alias-infieldbutton-fill-border-color-down:var(
--spectrum-alias-input-border-color-down
);--spectrum-alias-infieldbutton-fill-border-color-mouse-focus:var(
--spectrum-alias-input-border-color-mouse-focus
);--spectrum-alias-infieldbutton-fill-border-color-key-focus:var(
--spectrum-alias-input-border-color-key-focus
);--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-default:transparent;--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-hover:transparent;--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-down:transparent;--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-key-focus:transparent;--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-disabled:transparent;--spectrum-alias-infieldbutton-fill-loudnessMedium-background-color-default:var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-default
);--spectrum-alias-infieldbutton-fill-loudnessMedium-background-color-hover:var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-hover
);--spectrum-alias-infieldbutton-fill-loudnessMedium-background-color-down:var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-down
);--spectrum-alias-infieldbutton-fill-loudnessMedium-background-color-key-focus:var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-key-focus
);--spectrum-alias-infieldbutton-fill-loudnessMedium-background-color-disabled:transparent;--spectrum-alias-infieldbutton-fill-loudnessHigh-background-color-default:var(
--spectrum-alias-component-background-color-default
);--spectrum-alias-infieldbutton-fill-loudnessHigh-background-color-hover:var(
--spectrum-alias-component-background-color-hover
);--spectrum-alias-infieldbutton-fill-loudnessHigh-background-color-down:var(
--spectrum-alias-component-background-color-down
);--spectrum-alias-infieldbutton-fill-loudnessHigh-background-color-key-focus:var(
--spectrum-alias-component-background-color-key-focus
);--spectrum-alias-infieldbutton-fill-loudnessHigh-background-color-disabled:var(
--spectrum-alias-component-background-color-disabled
);--spectrum-alias-tabs-divider-background-color-default:var(
--spectrum-global-color-gray-300
);--spectrum-alias-tabs-divider-background-color-quiet:var(
--spectrum-alias-background-color-transparent
);--spectrum-alias-tabitem-text-color-default:var(
--spectrum-alias-label-text-color
);--spectrum-alias-tabitem-text-color-hover:var(
--spectrum-alias-text-color-hover
);--spectrum-alias-tabitem-text-color-down:var(
--spectrum-alias-text-color-down
);--spectrum-alias-tabitem-text-color-key-focus:var(
--spectrum-alias-text-color-hover
);--spectrum-alias-tabitem-text-color-mouse-focus:var(
--spectrum-alias-text-color-hover
);--spectrum-alias-tabitem-text-color:var(
--spectrum-alias-tabitem-text-color-default
);--spectrum-alias-tabitem-text-color-selected-default:var(
--spectrum-global-color-gray-900
);--spectrum-alias-tabitem-text-color-selected-hover:var(
--spectrum-alias-tabitem-text-color-selected-default
);--spectrum-alias-tabitem-text-color-selected-down:var(
--spectrum-alias-tabitem-text-color-selected-default
);--spectrum-alias-tabitem-text-color-selected-key-focus:var(
--spectrum-alias-tabitem-text-color-selected-default
);--spectrum-alias-tabitem-text-color-selected-mouse-focus:var(
--spectrum-alias-tabitem-text-color-selected-default
);--spectrum-alias-tabitem-text-color-selected:var(
--spectrum-alias-tabitem-text-color-selected-default
);--spectrum-alias-tabitem-text-color-emphasized:var(
--spectrum-alias-tabitem-text-color-default
);--spectrum-alias-tabitem-text-color-emphasized-selected-default:var(
--spectrum-global-color-static-blue-500
);--spectrum-alias-tabitem-text-color-emphasized-selected-hover:var(
--spectrum-alias-tabitem-text-color-emphasized-selected-default
);--spectrum-alias-tabitem-text-color-emphasized-selected-down:var(
--spectrum-alias-tabitem-text-color-emphasized-selected-default
);--spectrum-alias-tabitem-text-color-emphasized-selected-key-focus:var(
--spectrum-alias-tabitem-text-color-emphasized-selected-default
);--spectrum-alias-tabitem-text-color-emphasized-selected-mouse-focus:var(
--spectrum-alias-tabitem-text-color-emphasized-selected-default
);--spectrum-alias-tabitem-text-color-emphasized-selected:var(
--spectrum-alias-tabitem-text-color-emphasized-selected-default
);--spectrum-alias-tabitem-selection-indicator-color-default:var(
--spectrum-alias-tabitem-text-color-selected-default
);--spectrum-alias-tabitem-selection-indicator-color-emphasized:var(
--spectrum-alias-tabitem-text-color-emphasized-selected-default
);--spectrum-alias-tabitem-icon-color-disabled:var(
--spectrum-alias-text-color-disabled
);--spectrum-alias-tabitem-icon-color-default:var(
--spectrum-alias-icon-color
);--spectrum-alias-tabitem-icon-color-hover:var(
--spectrum-alias-icon-color-hover
);--spectrum-alias-tabitem-icon-color-down:var(
--spectrum-alias-icon-color-down
);--spectrum-alias-tabitem-icon-color-key-focus:var(
--spectrum-alias-icon-color-hover
);--spectrum-alias-tabitem-icon-color-mouse-focus:var(
--spectrum-alias-icon-color-down
);--spectrum-alias-tabitem-icon-color:var(
--spectrum-alias-tabitem-icon-color-default
);--spectrum-alias-tabitem-icon-color-selected:var(
--spectrum-alias-icon-color-selected-neutral
);--spectrum-alias-tabitem-icon-color-emphasized:var(
--spectrum-alias-tabitem-text-color-default
);--spectrum-alias-tabitem-icon-color-emphasized-selected:var(
--spectrum-alias-tabitem-text-color-emphasized-selected-default
);--spectrum-alias-assetcard-selectionindicator-background-color-ordered:var(
--spectrum-global-color-blue-500
);--spectrum-alias-assetcard-overlay-background-color:rgba(27,127,245,.1);--spectrum-alias-assetcard-border-color-selected:var(
--spectrum-global-color-blue-500
);--spectrum-alias-assetcard-border-color-selected-hover:var(
--spectrum-global-color-blue-500
);--spectrum-alias-assetcard-border-color-selected-down:var(
--spectrum-global-color-blue-600
);--spectrum-alias-background-color-default:var(
--spectrum-global-color-gray-100
);--spectrum-alias-background-color-disabled:var(
--spectrum-global-color-gray-200
);--spectrum-alias-background-color-transparent:transparent;--spectrum-alias-background-color-overbackground-down:hsla(0,0%,100%,.2);--spectrum-alias-background-color-quiet-overbackground-hover:hsla(0,0%,100%,.1);--spectrum-alias-background-color-quiet-overbackground-down:hsla(0,0%,100%,.2);--spectrum-alias-background-color-overbackground-disabled:hsla(0,0%,100%,.1);--spectrum-alias-background-color-quickactions-overlay:rgba(0,0,0,.2);--spectrum-alias-placeholder-text-color:var(
--spectrum-global-color-gray-800
);--spectrum-alias-placeholder-text-color-hover:var(
--spectrum-global-color-gray-900
);--spectrum-alias-placeholder-text-color-down:var(
--spectrum-global-color-gray-900
);--spectrum-alias-placeholder-text-color-selected:var(
--spectrum-global-color-gray-800
);--spectrum-alias-label-text-color:var(--spectrum-global-color-gray-700);--spectrum-alias-text-color:var(--spectrum-global-color-gray-800);--spectrum-alias-text-color-hover:var(--spectrum-global-color-gray-900);--spectrum-alias-text-color-down:var(--spectrum-global-color-gray-900);--spectrum-alias-text-color-key-focus:var(
--spectrum-global-color-blue-600
);--spectrum-alias-text-color-mouse-focus:var(
--spectrum-global-color-blue-600
);--spectrum-alias-text-color-disabled:var(--spectrum-global-color-gray-500);--spectrum-alias-text-color-invalid:var(--spectrum-global-color-red-500);--spectrum-alias-text-color-selected:var(--spectrum-global-color-blue-600);--spectrum-alias-text-color-selected-neutral:var(
--spectrum-global-color-gray-900
);--spectrum-alias-text-color-overbackground:var(
--spectrum-global-color-static-white
);--spectrum-alias-text-color-overbackground-disabled:hsla(0,0%,100%,.2);--spectrum-alias-text-color-quiet-overbackground-disabled:hsla(0,0%,100%,.2);--spectrum-alias-heading-text-color:var(--spectrum-global-color-gray-900);--spectrum-alias-border-color:var(--spectrum-global-color-gray-400);--spectrum-alias-border-color-hover:var(--spectrum-global-color-gray-500);--spectrum-alias-border-color-down:var(--spectrum-global-color-gray-500);--spectrum-alias-border-color-key-focus:var(
--spectrum-global-color-blue-400
);--spectrum-alias-border-color-mouse-focus:var(
--spectrum-global-color-blue-500
);--spectrum-alias-border-color-disabled:var(
--spectrum-global-color-gray-200
);--spectrum-alias-border-color-extralight:var(
--spectrum-global-color-gray-100
);--spectrum-alias-border-color-light:var(--spectrum-global-color-gray-200);--spectrum-alias-border-color-mid:var(--spectrum-global-color-gray-300);--spectrum-alias-border-color-dark:var(--spectrum-global-color-gray-400);--spectrum-alias-border-color-darker-default:var(
--spectrum-global-color-gray-600
);--spectrum-alias-border-color-darker-hover:var(
--spectrum-global-color-gray-900
);--spectrum-alias-border-color-darker-down:var(
--spectrum-global-color-gray-900
);--spectrum-alias-border-color-transparent:transparent;--spectrum-alias-border-color-translucent-dark:rgba(0,0,0,.05);--spectrum-alias-border-color-translucent-darker:rgba(0,0,0,.1);--spectrum-alias-focus-color:var(--spectrum-global-color-blue-400);--spectrum-alias-focus-ring-color:var(--spectrum-alias-focus-color);--spectrum-alias-track-color-default:var(--spectrum-global-color-gray-300);--spectrum-alias-track-fill-color-overbackground:var(
--spectrum-global-color-static-white
);--spectrum-alias-track-color-disabled:var(
--spectrum-global-color-gray-300
);--spectrum-alias-thumbnail-darksquare-background-color:var(
--spectrum-global-color-gray-300
);--spectrum-alias-thumbnail-lightsquare-background-color:var(
--spectrum-global-color-static-white
);--spectrum-alias-track-color-overbackground:hsla(0,0%,100%,.2);--spectrum-alias-icon-color:var(--spectrum-global-color-gray-700);--spectrum-alias-icon-color-overbackground:var(
--spectrum-global-color-static-white
);--spectrum-alias-icon-color-hover:var(--spectrum-global-color-gray-900);--spectrum-alias-icon-color-down:var(--spectrum-global-color-gray-900);--spectrum-alias-icon-color-key-focus:var(
--spectrum-global-color-gray-900
);--spectrum-alias-icon-color-disabled:var(--spectrum-global-color-gray-400);--spectrum-alias-icon-color-overbackground-disabled:hsla(0,0%,100%,.2);--spectrum-alias-icon-color-quiet-overbackground-disabled:hsla(0,0%,100%,.15);--spectrum-alias-icon-color-selected-neutral:var(
--spectrum-global-color-gray-900
);--spectrum-alias-icon-color-selected-neutral-subdued:var(
--spectrum-global-color-gray-800
);--spectrum-alias-icon-color-selected:var(--spectrum-global-color-blue-500);--spectrum-alias-icon-color-selected-hover:var(
--spectrum-global-color-blue-600
);--spectrum-alias-icon-color-selected-down:var(
--spectrum-global-color-blue-700
);--spectrum-alias-icon-color-selected-focus:var(
--spectrum-global-color-blue-600
);--spectrum-alias-image-opacity-disabled:var(
--spectrum-global-color-opacity-30
);--spectrum-alias-toolbar-background-color:var(
--spectrum-global-color-gray-100
);--spectrum-alias-code-highlight-color-default:var(
--spectrum-global-color-gray-800
);--spectrum-alias-code-highlight-background-color:var(
--spectrum-global-color-gray-75
);--spectrum-alias-code-highlight-color-keyword:var(
--spectrum-global-color-fuchsia-600
);--spectrum-alias-code-highlight-color-section:var(
--spectrum-global-color-red-600
);--spectrum-alias-code-highlight-color-literal:var(
--spectrum-global-color-blue-600
);--spectrum-alias-code-highlight-color-attribute:var(
--spectrum-global-color-seafoam-600
);--spectrum-alias-code-highlight-color-class:var(
--spectrum-global-color-magenta-600
);--spectrum-alias-code-highlight-color-variable:var(
--spectrum-global-color-purple-600
);--spectrum-alias-code-highlight-color-title:var(
--spectrum-global-color-indigo-600
);--spectrum-alias-code-highlight-color-string:var(
--spectrum-global-color-fuchsia-600
);--spectrum-alias-code-highlight-color-function:var(
--spectrum-global-color-blue-600
);--spectrum-alias-code-highlight-color-comment:var(
--spectrum-global-color-gray-700
);--spectrum-alias-categorical-color-1:var(
--spectrum-global-color-static-seafoam-200
);--spectrum-alias-categorical-color-2:var(
--spectrum-global-color-static-indigo-700
);--spectrum-alias-categorical-color-3:var(
--spectrum-global-color-static-orange-500
);--spectrum-alias-categorical-color-4:var(
--spectrum-global-color-static-magenta-500
);--spectrum-alias-categorical-color-5:var(
--spectrum-global-color-static-indigo-200
);--spectrum-alias-categorical-color-6:var(
--spectrum-global-color-static-celery-200
);--spectrum-alias-categorical-color-7:var(
--spectrum-global-color-static-blue-500
);--spectrum-alias-categorical-color-8:var(
--spectrum-global-color-static-purple-800
);--spectrum-alias-categorical-color-9:var(
--spectrum-global-color-static-yellow-500
);--spectrum-alias-categorical-color-10:var(
--spectrum-global-color-static-orange-700
);--spectrum-alias-categorical-color-11:var(
--spectrum-global-color-static-green-600
);--spectrum-alias-categorical-color-12:var(
--spectrum-global-color-static-chartreuse-300
);--spectrum-alias-categorical-color-13:var(
--spectrum-global-color-static-blue-200
);--spectrum-alias-categorical-color-14:var(
--spectrum-global-color-static-fuchsia-500
);--spectrum-alias-categorical-color-15:var(
--spectrum-global-color-static-magenta-200
);--spectrum-alias-categorical-color-16:var(
--spectrum-global-color-static-yellow-200
)}:host,:root{--spectrum-colorloupe-express-visibility:none;--spectrum-colorloupe-spectrum-visibility:block;--spectrum-colorloupe-outer-border-color:transparent;--spectrum-colorloupe-outer-border-size:0;--spectrum-colorloupe-outer-stroke-color:var(
--spectrum-global-color-static-transparent-black-200
);--spectrum-colorloupe-outer-stroke-width:var(
--spectrum-alias-border-size-thick
);--spectrum-colorhandle-background-offset:calc(var(--spectrum-global-dimension-static-size-25)*-1);--spectrum-colorhandle-inner-shadow-color:var(
--spectrum-colorhandle-outer-shadow-color
);--spectrum-colorhandle-outer-shadow-color:rgba(0,0,0,.42);--spectrum-colorhandle-outer-shadow-blur:0;--spectrum-colorhandle-outer-shadow-spread:var(
--spectrum-alias-border-size-thin
);--spectrum-colorcontrol-checkerboard-light-color:var(
--spectrum-global-color-static-white
);--spectrum-colorcontrol-checkerboard-dark-color:var(
--spectrum-global-color-static-gray-300
);--spectrum-slider-m-track-inside-border-radius:var(
--spectrum-slider-m-track-border-radius
);--spectrum-slider-label-text-size:var(
--spectrum-global-dimension-font-size-75
)}:host,:root{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host,:root{--spectrum-focus-indicator-color:var(--spectrum-blue-800);--spectrum-static-white-focus-indicator-color:var(--spectrum-white);--spectrum-static-black-focus-indicator-color:var(--spectrum-black);--spectrum-overlay-color:var(--spectrum-black);--spectrum-opacity-disabled:0.3;--spectrum-disabled-background-color:var(--spectrum-gray-200);--spectrum-disabled-static-white-background-color:var(
--spectrum-transparent-white-200
);--spectrum-disabled-static-black-background-color:var(
--spectrum-transparent-black-200
);--spectrum-background-opacity-default:0;--spectrum-background-opacity-hover:0.1;--spectrum-background-opacity-down:0.1;--spectrum-background-opacity-key-focus:0.1;--spectrum-neutral-content-color-default:var(--spectrum-gray-800);--spectrum-neutral-content-color-hover:var(--spectrum-gray-900);--spectrum-neutral-content-color-down:var(--spectrum-gray-900);--spectrum-neutral-content-color-focus-hover:var(
--spectrum-neutral-content-color-down
);--spectrum-neutral-content-color-focus:var(
--spectrum-neutral-content-color-down
);--spectrum-neutral-content-color-key-focus:var(--spectrum-gray-900);--spectrum-neutral-subdued-content-color-default:var(--spectrum-gray-700);--spectrum-neutral-subdued-content-color-hover:var(--spectrum-gray-800);--spectrum-neutral-subdued-content-color-down:var(--spectrum-gray-900);--spectrum-neutral-subdued-content-color-key-focus:var(
--spectrum-gray-800
);--spectrum-accent-content-color-default:var(--spectrum-accent-color-900);--spectrum-accent-content-color-hover:var(--spectrum-accent-color-1000);--spectrum-accent-content-color-down:var(--spectrum-accent-color-1100);--spectrum-accent-content-color-key-focus:var(
--spectrum-accent-color-1000
);--spectrum-negative-content-color-default:var(
--spectrum-negative-color-900
);--spectrum-negative-content-color-hover:var(
--spectrum-negative-color-1000
);--spectrum-negative-content-color-down:var(--spectrum-negative-color-1100);--spectrum-negative-content-color-key-focus:var(
--spectrum-negative-color-1000
);--spectrum-disabled-content-color:var(--spectrum-gray-400);--spectrum-disabled-static-white-content-color:var(
--spectrum-transparent-white-500
);--spectrum-disabled-static-black-content-color:var(
--spectrum-transparent-black-500
);--spectrum-disabled-border-color:var(--spectrum-gray-300);--spectrum-disabled-static-white-border-color:var(
--spectrum-transparent-white-300
);--spectrum-disabled-static-black-border-color:var(
--spectrum-transparent-black-300
);--spectrum-negative-border-color-default:var(
--spectrum-negative-color-900
);--spectrum-negative-border-color-hover:var(--spectrum-negative-color-1000);--spectrum-negative-border-color-down:var(--spectrum-negative-color-1100);--spectrum-negative-border-color-focus-hover:var(
--spectrum-negative-border-color-down
);--spectrum-negative-border-color-focus:var(--spectrum-negative-color-1000);--spectrum-negative-border-color-key-focus:var(
--spectrum-negative-color-1000
);--spectrum-swatch-border-color:var(--spectrum-gray-900);--spectrum-swatch-border-opacity:0.51;--spectrum-swatch-disabled-icon-border-color:var(--spectrum-black);--spectrum-swatch-disabled-icon-border-opacity:0.51;--spectrum-thumbnail-border-color:var(--spectrum-gray-800);--spectrum-thumbnail-border-opacity:0.1;--spectrum-thumbnail-opacity-disabled:var(--spectrum-opacity-disabled);--spectrum-opacity-checkerboard-square-light:var(--spectrum-white);--spectrum-avatar-opacity-disabled:var(--spectrum-opacity-disabled);--spectrum-color-area-border-color:var(--spectrum-gray-900);--spectrum-color-area-border-opacity:0.1;--spectrum-color-slider-border-color:var(--spectrum-gray-900);--spectrum-color-slider-border-opacity:0.1;--spectrum-color-loupe-drop-shadow-color:var(
--spectrum-transparent-black-300
);--spectrum-color-loupe-drop-shadow-y:2px;--spectrum-color-loupe-drop-shadow-blur:8px;--spectrum-color-loupe-inner-border:var(--spectrum-transparent-black-200);--spectrum-color-loupe-outer-border:var(--spectrum-white);--spectrum-card-selection-background-color:var(--spectrum-gray-100);--spectrum-card-selection-background-color-opacity:0.95;--spectrum-drop-zone-background-color:var(--spectrum-accent-visual-color);--spectrum-drop-zone-background-color-opacity:0.1;--spectrum-drop-zone-background-color-opacity-filled:0.3;--spectrum-white:#fff;--spectrum-transparent-white-100:hsla(0,0%,100%,0);--spectrum-transparent-white-200:hsla(0,0%,100%,.1);--spectrum-transparent-white-300:hsla(0,0%,100%,.25);--spectrum-transparent-white-400:hsla(0,0%,100%,.4);--spectrum-transparent-white-500:hsla(0,0%,100%,.55);--spectrum-transparent-white-600:hsla(0,0%,100%,.7);--spectrum-transparent-white-700:hsla(0,0%,100%,.8);--spectrum-transparent-white-800:hsla(0,0%,100%,.9);--spectrum-transparent-white-900:#fff;--spectrum-black:#000;--spectrum-transparent-black-100:transparent;--spectrum-transparent-black-200:rgba(0,0,0,.1);--spectrum-transparent-black-300:rgba(0,0,0,.25);--spectrum-transparent-black-400:rgba(0,0,0,.4);--spectrum-transparent-black-500:rgba(0,0,0,.55);--spectrum-transparent-black-600:rgba(0,0,0,.7);--spectrum-transparent-black-700:rgba(0,0,0,.8);--spectrum-transparent-black-800:rgba(0,0,0,.9);--spectrum-transparent-black-900:#000;--spectrum-radio-button-selection-indicator:4px;--spectrum-field-label-to-component:0px;--spectrum-help-text-to-component:0px;--spectrum-button-minimum-width-multiplier:2.25;--spectrum-divider-thickness-small:1px;--spectrum-divider-thickness-medium:2px;--spectrum-divider-thickness-large:4px;--spectrum-swatch-rectangle-width-multiplier:2;--spectrum-swatch-slash-thickness-extra-small:2px;--spectrum-swatch-slash-thickness-small:3px;--spectrum-swatch-slash-thickness-medium:4px;--spectrum-swatch-slash-thickness-large:5px;--spectrum-progress-bar-minimum-width:48px;--spectrum-progress-bar-maximum-width:768px;--spectrum-meter-minimum-width:48px;--spectrum-meter-maximum-width:768px;--spectrum-in-line-alert-minimum-width:240px;--spectrum-popover-tip-width:16px;--spectrum-popover-tip-height:8px;--spectrum-menu-item-label-to-description:1px;--spectrum-picker-minimum-width-multiplier:2;--spectrum-text-field-minimum-width-multiplier:1.5;--spectrum-combo-box-minimum-width-multiplier:2.5;--spectrum-combo-box-quiet-minimum-width-multiplier:2;--spectrum-combo-box-visual-to-field-button-quiet:0;--spectrum-alert-dialog-minimum-width:288px;--spectrum-alert-dialog-maximum-width:480px;--spectrum-contextual-help-minimum-width:268px;--spectrum-breadcrumbs-height:var(--spectrum-component-height-300);--spectrum-breadcrumbs-height-compact:var(--spectrum-component-height-200);--spectrum-breadcrumbs-end-edge-to-text:0px;--spectrum-breadcrumbs-truncated-menu-to-separator-icon:0px;--spectrum-breadcrumbs-start-edge-to-truncated-menu:0px;--spectrum-breadcrumbs-truncated-menu-to-bottom-text:0px;--spectrum-color-area-border-width:var(--spectrum-border-width-100);--spectrum-color-area-border-rounding:var(--spectrum-corner-radius-100);--spectrum-color-wheel-color-area-margin:12px;--spectrum-color-slider-minimum-length:200px;--spectrum-color-slider-border-width:1px;--spectrum-color-slider-border-rounding:4px;--spectrum-floating-action-button-drop-shadow-blur:12px;--spectrum-illustrated-message-maximum-width:380px;--spectrum-search-field-minimum-width-multiplier:3;--spectrum-color-loupe-outer-border-width:var(--spectrum-border-width-200);--spectrum-card-minimum-width:100px;--spectrum-card-preview-minimum-height:130px;--spectrum-card-selection-background-size:40px;--spectrum-drop-zone-width:428px;--spectrum-drop-zone-content-maximum-width:var(
--spectrum-illustrated-message-maximum-width
);--spectrum-drop-zone-border-dash-length:8px;--spectrum-drop-zone-border-dash-gap:4px;--spectrum-drop-zone-title-size:var(
--spectrum-illustrated-message-title-size
);--spectrum-drop-zone-cjk-title-size:var(
--spectrum-illustrated-message-cjk-title-size
);--spectrum-drop-zone-body-size:var(
--spectrum-illustrated-message-body-size
);--spectrum-android-elevation:2dp;--spectrum-spacing-50:2px;--spectrum-spacing-75:4px;--spectrum-spacing-100:8px;--spectrum-spacing-200:12px;--spectrum-spacing-300:16px;--spectrum-spacing-400:24px;--spectrum-spacing-500:32px;--spectrum-spacing-600:40px;--spectrum-spacing-700:48px;--spectrum-spacing-800:64px;--spectrum-spacing-900:80px;--spectrum-spacing-1000:96px;--spectrum-focus-indicator-thickness:2px;--spectrum-focus-indicator-gap:2px;--spectrum-border-width-200:2px;--spectrum-border-width-400:4px;--spectrum-field-edge-to-text-quiet:0px;--spectrum-field-edge-to-visual-quiet:0px;--spectrum-field-edge-to-border-quiet:0px;--spectrum-field-edge-to-alert-icon-quiet:0px;--spectrum-field-edge-to-validation-icon-quiet:0px;--spectrum-text-underline-thickness:1px;--spectrum-text-underline-gap:1px;--spectrum-informative-color-100:var(--spectrum-blue-100);--spectrum-informative-color-200:var(--spectrum-blue-200);--spectrum-informative-color-300:var(--spectrum-blue-300);--spectrum-informative-color-400:var(--spectrum-blue-400);--spectrum-informative-color-500:var(--spectrum-blue-500);--spectrum-informative-color-600:var(--spectrum-blue-600);--spectrum-informative-color-700:var(--spectrum-blue-700);--spectrum-informative-color-800:var(--spectrum-blue-800);--spectrum-informative-color-900:var(--spectrum-blue-900);--spectrum-informative-color-1000:var(--spectrum-blue-1000);--spectrum-informative-color-1100:var(--spectrum-blue-1100);--spectrum-informative-color-1200:var(--spectrum-blue-1200);--spectrum-informative-color-1300:var(--spectrum-blue-1300);--spectrum-informative-color-1400:var(--spectrum-blue-1400);--spectrum-negative-color-100:var(--spectrum-red-100);--spectrum-negative-color-200:var(--spectrum-red-200);--spectrum-negative-color-300:var(--spectrum-red-300);--spectrum-negative-color-400:var(--spectrum-red-400);--spectrum-negative-color-500:var(--spectrum-red-500);--spectrum-negative-color-600:var(--spectrum-red-600);--spectrum-negative-color-700:var(--spectrum-red-700);--spectrum-negative-color-800:var(--spectrum-red-800);--spectrum-negative-color-900:var(--spectrum-red-900);--spectrum-negative-color-1000:var(--spectrum-red-1000);--spectrum-negative-color-1100:var(--spectrum-red-1100);--spectrum-negative-color-1200:var(--spectrum-red-1200);--spectrum-negative-color-1300:var(--spectrum-red-1300);--spectrum-negative-color-1400:var(--spectrum-red-1400);--spectrum-notice-color-100:var(--spectrum-orange-100);--spectrum-notice-color-200:var(--spectrum-orange-200);--spectrum-notice-color-300:var(--spectrum-orange-300);--spectrum-notice-color-400:var(--spectrum-orange-400);--spectrum-notice-color-500:var(--spectrum-orange-500);--spectrum-notice-color-600:var(--spectrum-orange-600);--spectrum-notice-color-700:var(--spectrum-orange-700);--spectrum-notice-color-800:var(--spectrum-orange-800);--spectrum-notice-color-900:var(--spectrum-orange-900);--spectrum-notice-color-1000:var(--spectrum-orange-1000);--spectrum-notice-color-1100:var(--spectrum-orange-1100);--spectrum-notice-color-1200:var(--spectrum-orange-1200);--spectrum-notice-color-1300:var(--spectrum-orange-1300);--spectrum-notice-color-1400:var(--spectrum-orange-1400);--spectrum-positive-color-100:var(--spectrum-green-100);--spectrum-positive-color-200:var(--spectrum-green-200);--spectrum-positive-color-300:var(--spectrum-green-300);--spectrum-positive-color-400:var(--spectrum-green-400);--spectrum-positive-color-500:var(--spectrum-green-500);--spectrum-positive-color-600:var(--spectrum-green-600);--spectrum-positive-color-700:var(--spectrum-green-700);--spectrum-positive-color-800:var(--spectrum-green-800);--spectrum-positive-color-900:var(--spectrum-green-900);--spectrum-positive-color-1000:var(--spectrum-green-1000);--spectrum-positive-color-1100:var(--spectrum-green-1100);--spectrum-positive-color-1200:var(--spectrum-green-1200);--spectrum-positive-color-1300:var(--spectrum-green-1300);--spectrum-positive-color-1400:var(--spectrum-green-1400);--spectrum-default-font-family:var(--spectrum-sans-serif-font-family);--spectrum-sans-serif-font-family:Adobe Clean;--spectrum-serif-font-family:Adobe Clean Serif;--spectrum-cjk-font-family:Adobe Clean Han;--spectrum-light-font-weight:light;--spectrum-regular-font-weight:regular;--spectrum-medium-font-weight:medium;--spectrum-bold-font-weight:bold;--spectrum-extra-bold-font-weight:extra-bold;--spectrum-black-font-weight:#000;--spectrum-italic-font-style:italic;--spectrum-default-font-style:normal;--spectrum-line-height-100:1.3;--spectrum-line-height-200:1.5;--spectrum-cjk-line-height-100:1.5;--spectrum-cjk-line-height-200:1.7;--spectrum-cjk-letter-spacing:0.05em;--spectrum-heading-sans-serif-font-family:var(
--spectrum-sans-serif-font-family
);--spectrum-heading-serif-font-family:var(--spectrum-serif-font-family);--spectrum-heading-cjk-font-family:var(--spectrum-cjk-font-family);--spectrum-heading-sans-serif-light-font-weight:var(
--spectrum-light-font-weight
);--spectrum-heading-sans-serif-light-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-serif-light-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-heading-serif-light-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-cjk-light-font-weight:var(--spectrum-light-font-weight);--spectrum-heading-cjk-light-font-style:var(--spectrum-default-font-style);--spectrum-heading-sans-serif-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-serif-font-style:var(--spectrum-default-font-style);--spectrum-heading-cjk-font-style:var(--spectrum-default-font-style);--spectrum-heading-sans-serif-heavy-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-sans-serif-heavy-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-serif-heavy-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-serif-heavy-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-cjk-heavy-font-weight:var(--spectrum-black-font-weight);--spectrum-heading-cjk-heavy-font-style:var(--spectrum-default-font-style);--spectrum-heading-sans-serif-light-strong-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-heading-sans-serif-light-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-serif-light-strong-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-heading-serif-light-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-cjk-light-strong-font-weight:var(
--spectrum-extra-bold-font-weight
);--spectrum-heading-cjk-light-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-sans-serif-strong-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-sans-serif-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-serif-strong-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-serif-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-cjk-strong-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-cjk-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-sans-serif-heavy-strong-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-sans-serif-heavy-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-serif-heavy-strong-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-serif-heavy-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-cjk-heavy-strong-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-cjk-heavy-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-sans-serif-light-emphasized-font-weight:var(
--spectrum-light-font-weight
);--spectrum-heading-sans-serif-light-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-serif-light-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-heading-serif-light-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-cjk-light-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-heading-cjk-light-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-sans-serif-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-serif-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-cjk-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-cjk-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-sans-serif-heavy-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-sans-serif-heavy-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-serif-heavy-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-serif-heavy-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-cjk-heavy-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-cjk-heavy-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-sans-serif-light-strong-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-heading-sans-serif-light-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-serif-light-strong-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-heading-serif-light-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-cjk-light-strong-emphasized-font-weight:var(
--spectrum-extra-bold-font-weight
);--spectrum-heading-cjk-light-strong-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-sans-serif-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-sans-serif-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-serif-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-serif-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-cjk-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-cjk-strong-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-sans-serif-heavy-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-sans-serif-heavy-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-serif-heavy-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-serif-heavy-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-heading-cjk-heavy-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-heading-cjk-heavy-strong-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-heading-size-xxxl:var(--spectrum-font-size-1300);--spectrum-heading-size-xxl:var(--spectrum-font-size-1100);--spectrum-heading-size-xl:var(--spectrum-font-size-900);--spectrum-heading-size-l:var(--spectrum-font-size-700);--spectrum-heading-size-m:var(--spectrum-font-size-500);--spectrum-heading-size-s:var(--spectrum-font-size-300);--spectrum-heading-size-xs:var(--spectrum-font-size-200);--spectrum-heading-size-xxs:var(--spectrum-font-size-100);--spectrum-heading-cjk-size-xxxl:var(--spectrum-font-size-1300);--spectrum-heading-cjk-size-xxl:var(--spectrum-font-size-900);--spectrum-heading-cjk-size-xl:var(--spectrum-font-size-800);--spectrum-heading-cjk-size-l:var(--spectrum-font-size-600);--spectrum-heading-cjk-size-m:var(--spectrum-font-size-400);--spectrum-heading-cjk-size-s:var(--spectrum-font-size-300);--spectrum-heading-cjk-size-xs:var(--spectrum-font-size-200);--spectrum-heading-cjk-size-xxs:var(--spectrum-font-size-100);--spectrum-heading-line-height:var(--spectrum-line-height-100);--spectrum-heading-cjk-line-height:var(--spectrum-cjk-line-height-100);--spectrum-heading-margin-top-multiplier:0.88888889;--spectrum-heading-margin-bottom-multiplier:0.25;--spectrum-heading-color:var(--spectrum-gray-900);--spectrum-body-sans-serif-font-family:var(
--spectrum-sans-serif-font-family
);--spectrum-body-serif-font-family:var(--spectrum-serif-font-family);--spectrum-body-cjk-font-family:var(--spectrum-cjk-font-family);--spectrum-body-sans-serif-font-weight:var(--spectrum-regular-font-weight);--spectrum-body-sans-serif-font-style:var(--spectrum-default-font-style);--spectrum-body-serif-font-weight:var(--spectrum-regular-font-weight);--spectrum-body-serif-font-style:var(--spectrum-default-font-style);--spectrum-body-cjk-font-weight:var(--spectrum-regular-font-weight);--spectrum-body-cjk-font-style:var(--spectrum-default-font-style);--spectrum-body-sans-serif-strong-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-body-sans-serif-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-body-serif-strong-font-weight:var(--spectrum-bold-font-weight);--spectrum-body-serif-strong-font-style:var(--spectrum-default-font-style);--spectrum-body-cjk-strong-font-weight:var(--spectrum-black-font-weight);--spectrum-body-cjk-strong-font-style:var(--spectrum-default-font-style);--spectrum-body-sans-serif-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-body-sans-serif-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-body-serif-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-body-serif-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-body-cjk-emphasized-font-weight:var(
--spectrum-extra-bold-font-weight
);--spectrum-body-cjk-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-body-sans-serif-strong-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-body-sans-serif-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-body-serif-strong-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-body-serif-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-body-cjk-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-body-cjk-strong-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-body-size-xxxl:var(--spectrum-font-size-600);--spectrum-body-size-xxl:var(--spectrum-font-size-500);--spectrum-body-size-xl:var(--spectrum-font-size-400);--spectrum-body-size-l:var(--spectrum-font-size-300);--spectrum-body-size-m:var(--spectrum-font-size-200);--spectrum-body-size-s:var(--spectrum-font-size-100);--spectrum-body-size-xs:var(--spectrum-font-size-75);--spectrum-body-line-height:var(--spectrum-line-height-200);--spectrum-body-cjk-line-height:var(--spectrum-cjk-line-height-200);--spectrum-body-margin-multiplier:0.75;--spectrum-body-color:var(--spectrum-gray-800);--spectrum-detail-sans-serif-font-family:var(
--spectrum-sans-serif-font-family
);--spectrum-detail-serif-font-family:var(--spectrum-serif-font-family);--spectrum-detail-cjk-font-family:var(--spectrum-cjk-font-family);--spectrum-detail-sans-serif-font-weight:var(--spectrum-bold-font-weight);--spectrum-detail-sans-serif-font-style:var(--spectrum-default-font-style);--spectrum-detail-serif-font-weight:var(--spectrum-bold-font-weight);--spectrum-detail-serif-font-style:var(--spectrum-default-font-style);--spectrum-detail-cjk-font-weight:var(--spectrum-extra-bold-font-weight);--spectrum-detail-cjk-font-style:var(--spectrum-default-font-style);--spectrum-detail-sans-serif-light-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-sans-serif-light-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-serif-light-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-serif-light-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-cjk-light-font-weight:var(--spectrum-light-font-weight);--spectrum-detail-cjk-light-font-style:var(--spectrum-default-font-style);--spectrum-detail-sans-serif-strong-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-detail-sans-serif-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-serif-strong-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-detail-serif-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-cjk-strong-font-weight:var(--spectrum-black-font-weight);--spectrum-detail-cjk-strong-font-style:var(--spectrum-default-font-style);--spectrum-detail-sans-serif-light-strong-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-sans-serif-light-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-serif-light-strong-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-serif-light-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-cjk-light-strong-font-weight:var(
--spectrum-extra-bold-font-weight
);--spectrum-detail-cjk-light-strong-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-sans-serif-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-detail-sans-serif-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-detail-serif-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-detail-serif-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-detail-cjk-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-detail-cjk-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-sans-serif-light-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-sans-serif-light-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-detail-serif-light-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-serif-light-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-detail-cjk-light-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-cjk-light-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-sans-serif-strong-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-detail-sans-serif-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-detail-serif-strong-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-detail-serif-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-detail-cjk-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-detail-cjk-strong-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-sans-serif-light-strong-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-sans-serif-light-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-detail-serif-light-strong-emphasized-font-weight:var(
--spectrum-regular-font-weight
);--spectrum-detail-serif-light-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-detail-cjk-light-strong-emphasized-font-weight:var(
--spectrum-extra-bold-font-weight
);--spectrum-detail-cjk-light-strong-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-detail-size-xl:var(--spectrum-font-size-200);--spectrum-detail-size-l:var(--spectrum-font-size-100);--spectrum-detail-size-m:var(--spectrum-font-size-75);--spectrum-detail-size-s:var(--spectrum-font-size-50);--spectrum-detail-line-height:var(--spectrum-line-height-100);--spectrum-detail-cjk-line-height:var(--spectrum-cjk-line-height-100);--spectrum-detail-margin-top-multiplier:0.88888889;--spectrum-detail-margin-bottom-multiplier:0.25;--spectrum-detail-letter-spacing:0.06em;--spectrum-detail-sans-serif-text-transform:uppercase;--spectrum-detail-serif-text-transform:uppercase;--spectrum-detail-color:var(--spectrum-gray-900);--spectrum-code-font-family:Source Code Pro;--spectrum-code-cjk-font-family:var(--spectrum-code-font-family);--spectrum-code-font-weight:var(--spectrum-regular-font-weight);--spectrum-code-font-style:var(--spectrum-default-font-style);--spectrum-code-cjk-font-weight:var(--spectrum-regular-font-weight);--spectrum-code-cjk-font-style:var(--spectrum-default-font-style);--spectrum-code-strong-font-weight:var(--spectrum-bold-font-weight);--spectrum-code-strong-font-style:var(--spectrum-default-font-style);--spectrum-code-cjk-strong-font-weight:var(--spectrum-black-font-weight);--spectrum-code-cjk-strong-font-style:var(--spectrum-default-font-style);--spectrum-code-emphasized-font-weight:var(--spectrum-regular-font-weight);--spectrum-code-emphasized-font-style:var(--spectrum-italic-font-style);--spectrum-code-cjk-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-code-cjk-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-code-strong-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-code-strong-emphasized-font-style:var(
--spectrum-italic-font-style
);--spectrum-code-cjk-strong-emphasized-font-weight:var(
--spectrum-black-font-weight
);--spectrum-code-cjk-strong-emphasized-font-style:var(
--spectrum-default-font-style
);--spectrum-code-size-xl:var(--spectrum-font-size-400);--spectrum-code-size-l:var(--spectrum-font-size-300);--spectrum-code-size-m:var(--spectrum-font-size-200);--spectrum-code-size-s:var(--spectrum-font-size-100);--spectrum-code-size-xs:var(--spectrum-font-size-75);--spectrum-code-line-height:var(--spectrum-line-height-200);--spectrum-code-cjk-line-height:var(--spectrum-cjk-line-height-200);--spectrum-code-color:var(--spectrum-gray-800)}:host,:root{--spectrum-neutral-background-color-selected-default:var(
--spectrum-gray-700
);--spectrum-neutral-background-color-selected-hover:var(
--spectrum-gray-800
);--spectrum-neutral-background-color-selected-down:var(--spectrum-gray-900);--spectrum-neutral-background-color-selected-key-focus:var(
--spectrum-gray-800
);--spectrum-slider-track-thickness:2px;--spectrum-slider-handle-gap:4px;--spectrum-color-loupe-height:64px;--spectrum-color-loupe-width:48px;--spectrum-color-loupe-bottom-to-color-handle:12px;--spectrum-color-loupe-inner-border-width:var(--spectrum-border-width-200);--spectrum-border-width-100:1px;--spectrum-accent-color-100:var(--spectrum-blue-100);--spectrum-accent-color-200:var(--spectrum-blue-200);--spectrum-accent-color-300:var(--spectrum-blue-300);--spectrum-accent-color-400:var(--spectrum-blue-400);--spectrum-accent-color-500:var(--spectrum-blue-500);--spectrum-accent-color-600:var(--spectrum-blue-600);--spectrum-accent-color-700:var(--spectrum-blue-700);--spectrum-accent-color-800:var(--spectrum-blue-800);--spectrum-accent-color-900:var(--spectrum-blue-900);--spectrum-accent-color-1000:var(--spectrum-blue-1000);--spectrum-accent-color-1100:var(--spectrum-blue-1100);--spectrum-accent-color-1200:var(--spectrum-blue-1200);--spectrum-accent-color-1300:var(--spectrum-blue-1300);--spectrum-accent-color-1400:var(--spectrum-blue-1400);--spectrum-heading-sans-serif-font-weight:var(--spectrum-bold-font-weight);--spectrum-heading-serif-font-weight:var(--spectrum-bold-font-weight);--spectrum-heading-cjk-font-weight:var(--spectrum-extra-bold-font-weight);--spectrum-heading-sans-serif-emphasized-font-weight:var(
--spectrum-bold-font-weight
);--spectrum-heading-serif-emphasized-font-weight:var(
--spectrum-bold-font-weight
)}:host,:root{--system-spectrum-actionbutton-background-color-default:var(
--spectrum-gray-75
);--system-spectrum-actionbutton-background-color-hover:var(
--spectrum-gray-200
);--system-spectrum-actionbutton-background-color-down:var(
--spectrum-gray-300
);--system-spectrum-actionbutton-background-color-focus:var(
--spectrum-gray-200
);--system-spectrum-actionbutton-border-color-default:var(
--spectrum-gray-400
);--system-spectrum-actionbutton-border-color-hover:var(--spectrum-gray-500);--system-spectrum-actionbutton-border-color-down:var(--spectrum-gray-600);--system-spectrum-actionbutton-border-color-focus:var(--spectrum-gray-500);--system-spectrum-actionbutton-content-color-default:var(
--spectrum-neutral-content-color-default
);--system-spectrum-actionbutton-content-color-hover:var(
--spectrum-neutral-content-color-hover
);--system-spectrum-actionbutton-content-color-down:var(
--spectrum-neutral-content-color-down
);--system-spectrum-actionbutton-content-color-focus:var(
--spectrum-neutral-content-color-key-focus
);--system-spectrum-actionbutton-background-color-disabled:transparent;--system-spectrum-actionbutton-border-color-disabled:var(
--spectrum-disabled-border-color
);--system-spectrum-actionbutton-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-actionbutton-quiet-background-color-default:transparent;--system-spectrum-actionbutton-quiet-background-color-hover:var(
--spectrum-gray-200
);--system-spectrum-actionbutton-quiet-background-color-down:var(
--spectrum-gray-300
);--system-spectrum-actionbutton-quiet-background-color-focus:var(
--spectrum-gray-200
);--system-spectrum-actionbutton-quiet-border-color-default:transparent;--system-spectrum-actionbutton-quiet-border-color-hover:transparent;--system-spectrum-actionbutton-quiet-border-color-down:transparent;--system-spectrum-actionbutton-quiet-border-color-focus:transparent;--system-spectrum-actionbutton-quiet-background-color-disabled:transparent;--system-spectrum-actionbutton-quiet-border-color-disabled:transparent;--system-spectrum-actionbutton-selected-background-color-default:var(
--spectrum-neutral-subdued-background-color-default
);--system-spectrum-actionbutton-selected-background-color-hover:var(
--spectrum-neutral-subdued-background-color-hover
);--system-spectrum-actionbutton-selected-background-color-down:var(
--spectrum-neutral-subdued-background-color-down
);--system-spectrum-actionbutton-selected-background-color-focus:var(
--spectrum-neutral-subdued-background-color-key-focus
);--system-spectrum-actionbutton-selected-border-color-default:transparent;--system-spectrum-actionbutton-selected-border-color-hover:transparent;--system-spectrum-actionbutton-selected-border-color-down:transparent;--system-spectrum-actionbutton-selected-border-color-focus:transparent;--system-spectrum-actionbutton-selected-content-color-default:var(
--spectrum-white
);--system-spectrum-actionbutton-selected-content-color-hover:var(
--spectrum-white
);--system-spectrum-actionbutton-selected-content-color-down:var(
--spectrum-white
);--system-spectrum-actionbutton-selected-content-color-focus:var(
--spectrum-white
);--system-spectrum-actionbutton-selected-background-color-disabled:var(
--spectrum-disabled-background-color
);--system-spectrum-actionbutton-selected-border-color-disabled:transparent;--system-spectrum-actionbutton-selected-emphasized-background-color-default:var(
--spectrum-accent-background-color-default
);--system-spectrum-actionbutton-selected-emphasized-background-color-hover:var(
--spectrum-accent-background-color-hover
);--system-spectrum-actionbutton-selected-emphasized-background-color-down:var(
--spectrum-accent-background-color-down
);--system-spectrum-actionbutton-selected-emphasized-background-color-focus:var(
--spectrum-accent-background-color-key-focus
);--system-spectrum-actionbutton-staticblack-quiet-border-color-default:transparent;--system-spectrum-actionbutton-staticwhite-quiet-border-color-default:transparent;--system-spectrum-actionbutton-staticblack-quiet-border-color-hover:transparent;--system-spectrum-actionbutton-staticwhite-quiet-border-color-hover:transparent;--system-spectrum-actionbutton-staticblack-quiet-border-color-down:transparent;--system-spectrum-actionbutton-staticwhite-quiet-border-color-down:transparent;--system-spectrum-actionbutton-staticblack-quiet-border-color-focus:transparent;--system-spectrum-actionbutton-staticwhite-quiet-border-color-focus:transparent;--system-spectrum-actionbutton-staticblack-quiet-border-color-disabled:transparent;--system-spectrum-actionbutton-staticwhite-quiet-border-color-disabled:transparent;--system-spectrum-actionbutton-staticblack-background-color-default:transparent;--system-spectrum-actionbutton-staticblack-background-color-hover:var(
--spectrum-transparent-black-300
);--system-spectrum-actionbutton-staticblack-background-color-down:var(
--spectrum-transparent-black-400
);--system-spectrum-actionbutton-staticblack-background-color-focus:var(
--spectrum-transparent-black-300
);--system-spectrum-actionbutton-staticblack-border-color-default:var(
--spectrum-transparent-black-400
);--system-spectrum-actionbutton-staticblack-border-color-hover:var(
--spectrum-transparent-black-500
);--system-spectrum-actionbutton-staticblack-border-color-down:var(
--spectrum-transparent-black-600
);--system-spectrum-actionbutton-staticblack-border-color-focus:var(
--spectrum-transparent-black-500
);--system-spectrum-actionbutton-staticblack-content-color-default:var(
--spectrum-black
);--system-spectrum-actionbutton-staticblack-content-color-hover:var(
--spectrum-black
);--system-spectrum-actionbutton-staticblack-content-color-down:var(
--spectrum-black
);--system-spectrum-actionbutton-staticblack-content-color-focus:var(
--spectrum-black
);--system-spectrum-actionbutton-staticblack-focus-indicator-color:var(
--spectrum-static-black-focus-indicator-color
);--system-spectrum-actionbutton-staticblack-background-color-disabled:transparent;--system-spectrum-actionbutton-staticblack-border-color-disabled:var(
--spectrum-disabled-static-black-border-color
);--system-spectrum-actionbutton-staticblack-content-color-disabled:var(
--spectrum-disabled-static-black-content-color
);--system-spectrum-actionbutton-staticblack-selected-background-color-default:var(
--spectrum-transparent-black-800
);--system-spectrum-actionbutton-staticblack-selected-background-color-hover:var(
--spectrum-transparent-black-900
);--system-spectrum-actionbutton-staticblack-selected-background-color-down:var(
--spectrum-transparent-black-900
);--system-spectrum-actionbutton-staticblack-selected-background-color-focus:var(
--spectrum-transparent-black-900
);--system-spectrum-actionbutton-staticblack-selected-border-color-disabled:transparent;--system-spectrum-actionbutton-staticblack-selected-content-color-default:var(
--spectrum-white
);--system-spectrum-actionbutton-staticblack-selected-content-color-hover:var(
--spectrum-white
);--system-spectrum-actionbutton-staticblack-selected-content-color-down:var(
--spectrum-white
);--system-spectrum-actionbutton-staticblack-selected-content-color-focus:var(
--spectrum-white
);--system-spectrum-actionbutton-staticblack-selected-background-color-disabled:var(
--spectrum-disabled-static-black-background-color
);--system-spectrum-actionbutton-staticwhite-background-color-default:transparent;--system-spectrum-actionbutton-staticwhite-background-color-hover:var(
--spectrum-transparent-white-300
);--system-spectrum-actionbutton-staticwhite-background-color-down:var(
--spectrum-transparent-white-400
);--system-spectrum-actionbutton-staticwhite-background-color-focus:var(
--spectrum-transparent-white-300
);--system-spectrum-actionbutton-staticwhite-border-color-default:var(
--spectrum-transparent-white-400
);--system-spectrum-actionbutton-staticwhite-border-color-hover:var(
--spectrum-transparent-white-500
);--system-spectrum-actionbutton-staticwhite-border-color-down:var(
--spectrum-transparent-white-600
);--system-spectrum-actionbutton-staticwhite-border-color-focus:var(
--spectrum-transparent-white-500
);--system-spectrum-actionbutton-staticwhite-content-color-default:var(
--spectrum-white
);--system-spectrum-actionbutton-staticwhite-content-color-hover:var(
--spectrum-white
);--system-spectrum-actionbutton-staticwhite-content-color-down:var(
--spectrum-white
);--system-spectrum-actionbutton-staticwhite-content-color-focus:var(
--spectrum-white
);--system-spectrum-actionbutton-staticwhite-focus-indicator-color:var(
--spectrum-static-white-focus-indicator-color
);--system-spectrum-actionbutton-staticwhite-background-color-disabled:transparent;--system-spectrum-actionbutton-staticwhite-border-color-disabled:var(
--spectrum-disabled-static-white-border-color
);--system-spectrum-actionbutton-staticwhite-content-color-disabled:var(
--spectrum-disabled-static-white-content-color
);--system-spectrum-actionbutton-staticwhite-selected-background-color-default:var(
--spectrum-transparent-white-800
);--system-spectrum-actionbutton-staticwhite-selected-background-color-hover:var(
--spectrum-transparent-white-900
);--system-spectrum-actionbutton-staticwhite-selected-background-color-down:var(
--spectrum-transparent-white-900
);--system-spectrum-actionbutton-staticwhite-selected-background-color-focus:var(
--spectrum-transparent-white-900
);--system-spectrum-actionbutton-staticwhite-selected-content-color-default:var(
--spectrum-black
);--system-spectrum-actionbutton-staticwhite-selected-content-color-hover:var(
--spectrum-black
);--system-spectrum-actionbutton-staticwhite-selected-content-color-down:var(
--spectrum-black
);--system-spectrum-actionbutton-staticwhite-selected-content-color-focus:var(
--spectrum-black
);--system-spectrum-actionbutton-staticwhite-selected-background-color-disabled:var(
--spectrum-disabled-static-white-background-color
);--system-spectrum-actionbutton-staticwhite-selected-border-color-disabled:transparent}:host,:root{--system-spectrum-checkbox-control-color-default:var(--spectrum-gray-600);--system-spectrum-checkbox-control-color-hover:var(--spectrum-gray-700);--system-spectrum-checkbox-control-color-down:var(--spectrum-gray-800);--system-spectrum-checkbox-control-color-focus:var(--spectrum-gray-700);--system-spectrum-checkbox-control-selected-color-default:var(
--spectrum-gray-700
);--system-spectrum-checkbox-control-selected-color-hover:var(
--spectrum-gray-800
);--system-spectrum-checkbox-control-selected-color-down:var(
--spectrum-gray-900
)}:host,:root{--system-spectrum-button-background-color-default:var(--spectrum-gray-75);--system-spectrum-button-background-color-hover:var(--spectrum-gray-200);--system-spectrum-button-background-color-down:var(--spectrum-gray-300);--system-spectrum-button-background-color-focus:var(--spectrum-gray-200);--system-spectrum-button-border-color-default:var(--spectrum-gray-400);--system-spectrum-button-border-color-hover:var(--spectrum-gray-500);--system-spectrum-button-border-color-down:var(--spectrum-gray-600);--system-spectrum-button-border-color-focus:var(--spectrum-gray-500);--system-spectrum-button-content-color-default:var(
--spectrum-neutral-content-color-default
);--system-spectrum-button-content-color-hover:var(
--spectrum-neutral-content-color-hover
);--system-spectrum-button-content-color-down:var(
--spectrum-neutral-content-color-down
);--system-spectrum-button-content-color-focus:var(
--spectrum-neutral-content-color-key-focus
);--system-spectrum-button-background-color-disabled:transparent;--system-spectrum-button-border-color-disabled:var(
--spectrum-disabled-border-color
);--system-spectrum-button-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-accent-background-color-default:var(
--spectrum-accent-background-color-default
);--system-spectrum-button-accent-background-color-hover:var(
--spectrum-accent-background-color-hover
);--system-spectrum-button-accent-background-color-down:var(
--spectrum-accent-background-color-down
);--system-spectrum-button-accent-background-color-focus:var(
--spectrum-accent-background-color-key-focus
);--system-spectrum-button-accent-border-color-default:transparent;--system-spectrum-button-accent-border-color-hover:transparent;--system-spectrum-button-accent-border-color-down:transparent;--system-spectrum-button-accent-border-color-focus:transparent;--system-spectrum-button-accent-content-color-default:var(
--spectrum-white
);--system-spectrum-button-accent-content-color-hover:var(--spectrum-white);--system-spectrum-button-accent-content-color-down:var(--spectrum-white);--system-spectrum-button-accent-content-color-focus:var(--spectrum-white);--system-spectrum-button-accent-background-color-disabled:var(
--spectrum-disabled-background-color
);--system-spectrum-button-accent-border-color-disabled:transparent;--system-spectrum-button-accent-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-accent-outline-background-color-default:transparent;--system-spectrum-button-accent-outline-background-color-hover:var(
--spectrum-accent-color-200
);--system-spectrum-button-accent-outline-background-color-down:var(
--spectrum-accent-color-300
);--system-spectrum-button-accent-outline-background-color-focus:var(
--spectrum-accent-color-200
);--system-spectrum-button-accent-outline-border-color-default:var(
--spectrum-accent-color-900
);--system-spectrum-button-accent-outline-border-color-hover:var(
--spectrum-accent-color-1000
);--system-spectrum-button-accent-outline-border-color-down:var(
--spectrum-accent-color-1100
);--system-spectrum-button-accent-outline-border-color-focus:var(
--spectrum-accent-color-1000
);--system-spectrum-button-accent-outline-content-color-default:var(
--spectrum-accent-content-color-default
);--system-spectrum-button-accent-outline-content-color-hover:var(
--spectrum-accent-content-color-hover
);--system-spectrum-button-accent-outline-content-color-down:var(
--spectrum-accent-content-color-down
);--system-spectrum-button-accent-outline-content-color-focus:var(
--spectrum-accent-content-color-key-focus
);--system-spectrum-button-accent-outline-background-color-disabled:transparent;--system-spectrum-button-accent-outline-border-color-disabled:var(
--spectrum-disabled-border-color
);--system-spectrum-button-accent-outline-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-negative-background-color-default:var(
--spectrum-negative-background-color-default
);--system-spectrum-button-negative-background-color-hover:var(
--spectrum-negative-background-color-hover
);--system-spectrum-button-negative-background-color-down:var(
--spectrum-negative-background-color-down
);--system-spectrum-button-negative-background-color-focus:var(
--spectrum-negative-background-color-key-focus
);--system-spectrum-button-negative-border-color-default:transparent;--system-spectrum-button-negative-border-color-hover:transparent;--system-spectrum-button-negative-border-color-down:transparent;--system-spectrum-button-negative-border-color-focus:transparent;--system-spectrum-button-negative-content-color-default:var(
--spectrum-white
);--system-spectrum-button-negative-content-color-hover:var(
--spectrum-white
);--system-spectrum-button-negative-content-color-down:var(--spectrum-white);--system-spectrum-button-negative-content-color-focus:var(
--spectrum-white
);--system-spectrum-button-negative-background-color-disabled:var(
--spectrum-disabled-background-color
);--system-spectrum-button-negative-border-color-disabled:transparent;--system-spectrum-button-negative-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-negative-outline-background-color-default:transparent;--system-spectrum-button-negative-outline-background-color-hover:var(
--spectrum-negative-color-200
);--system-spectrum-button-negative-outline-background-color-down:var(
--spectrum-negative-color-300
);--system-spectrum-button-negative-outline-background-color-focus:var(
--spectrum-negative-color-200
);--system-spectrum-button-negative-outline-border-color-default:var(
--spectrum-negative-color-900
);--system-spectrum-button-negative-outline-border-color-hover:var(
--spectrum-negative-color-1000
);--system-spectrum-button-negative-outline-border-color-down:var(
--spectrum-negative-color-1100
);--system-spectrum-button-negative-outline-border-color-focus:var(
--spectrum-negative-color-1000
);--system-spectrum-button-negative-outline-content-color-default:var(
--spectrum-negative-content-color-default
);--system-spectrum-button-negative-outline-content-color-hover:var(
--spectrum-negative-content-color-hover
);--system-spectrum-button-negative-outline-content-color-down:var(
--spectrum-negative-content-color-down
);--system-spectrum-button-negative-outline-content-color-focus:var(
--spectrum-negative-content-color-key-focus
);--system-spectrum-button-negative-outline-background-color-disabled:transparent;--system-spectrum-button-negative-outline-border-color-disabled:var(
--spectrum-disabled-border-color
);--system-spectrum-button-negative-outline-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-primary-background-color-default:var(
--spectrum-neutral-background-color-default
);--system-spectrum-button-primary-background-color-hover:var(
--spectrum-neutral-background-color-hover
);--system-spectrum-button-primary-background-color-down:var(
--spectrum-neutral-background-color-down
);--system-spectrum-button-primary-background-color-focus:var(
--spectrum-neutral-background-color-key-focus
);--system-spectrum-button-primary-border-color-default:transparent;--system-spectrum-button-primary-border-color-hover:transparent;--system-spectrum-button-primary-border-color-down:transparent;--system-spectrum-button-primary-border-color-focus:transparent;--system-spectrum-button-primary-content-color-default:var(
--spectrum-white
);--system-spectrum-button-primary-content-color-hover:var(--spectrum-white);--system-spectrum-button-primary-content-color-down:var(--spectrum-white);--system-spectrum-button-primary-content-color-focus:var(--spectrum-white);--system-spectrum-button-primary-background-color-disabled:var(
--spectrum-disabled-background-color
);--system-spectrum-button-primary-border-color-disabled:transparent;--system-spectrum-button-primary-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-primary-outline-background-color-default:transparent;--system-spectrum-button-primary-outline-background-color-hover:var(
--spectrum-gray-300
);--system-spectrum-button-primary-outline-background-color-down:var(
--spectrum-gray-400
);--system-spectrum-button-primary-outline-background-color-focus:var(
--spectrum-gray-300
);--system-spectrum-button-primary-outline-border-color-default:var(
--spectrum-gray-800
);--system-spectrum-button-primary-outline-border-color-hover:var(
--spectrum-gray-900
);--system-spectrum-button-primary-outline-border-color-down:var(
--spectrum-gray-900
);--system-spectrum-button-primary-outline-border-color-focus:var(
--spectrum-gray-900
);--system-spectrum-button-primary-outline-content-color-default:var(
--spectrum-neutral-content-color-default
);--system-spectrum-button-primary-outline-content-color-hover:var(
--spectrum-neutral-content-color-hover
);--system-spectrum-button-primary-outline-content-color-down:var(
--spectrum-neutral-content-color-down
);--system-spectrum-button-primary-outline-content-color-focus:var(
--spectrum-neutral-content-color-key-focus
);--system-spectrum-button-primary-outline-background-color-disabled:transparent;--system-spectrum-button-primary-outline-border-color-disabled:var(
--spectrum-disabled-border-color
);--system-spectrum-button-primary-outline-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-secondary-background-color-default:var(
--spectrum-gray-200
);--system-spectrum-button-secondary-background-color-hover:var(
--spectrum-gray-300
);--system-spectrum-button-secondary-background-color-down:var(
--spectrum-gray-400
);--system-spectrum-button-secondary-background-color-focus:var(
--spectrum-gray-300
);--system-spectrum-button-secondary-border-color-default:transparent;--system-spectrum-button-secondary-border-color-hover:transparent;--system-spectrum-button-secondary-border-color-down:transparent;--system-spectrum-button-secondary-border-color-focus:transparent;--system-spectrum-button-secondary-content-color-default:var(
--spectrum-neutral-content-color-default
);--system-spectrum-button-secondary-content-color-hover:var(
--spectrum-neutral-content-color-hover
);--system-spectrum-button-secondary-content-color-down:var(
--spectrum-neutral-content-color-down
);--system-spectrum-button-secondary-content-color-focus:var(
--spectrum-neutral-content-color-key-focus
);--system-spectrum-button-secondary-background-color-disabled:var(
--spectrum-disabled-background-color
);--system-spectrum-button-secondary-border-color-disabled:transparent;--system-spectrum-button-secondary-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-secondary-outline-background-color-default:transparent;--system-spectrum-button-secondary-outline-background-color-hover:var(
--spectrum-gray-300
);--system-spectrum-button-secondary-outline-background-color-down:var(
--spectrum-gray-400
);--system-spectrum-button-secondary-outline-background-color-focus:var(
--spectrum-gray-300
);--system-spectrum-button-secondary-outline-border-color-default:var(
--spectrum-gray-300
);--system-spectrum-button-secondary-outline-border-color-hover:var(
--spectrum-gray-400
);--system-spectrum-button-secondary-outline-border-color-down:var(
--spectrum-gray-500
);--system-spectrum-button-secondary-outline-border-color-focus:var(
--spectrum-gray-400
);--system-spectrum-button-secondary-outline-content-color-default:var(
--spectrum-neutral-content-color-default
);--system-spectrum-button-secondary-outline-content-color-hover:var(
--spectrum-neutral-content-color-hover
);--system-spectrum-button-secondary-outline-content-color-down:var(
--spectrum-neutral-content-color-down
);--system-spectrum-button-secondary-outline-content-color-focus:var(
--spectrum-neutral-content-color-key-focus
);--system-spectrum-button-secondary-outline-background-color-disabled:transparent;--system-spectrum-button-secondary-outline-border-color-disabled:var(
--spectrum-disabled-border-color
);--system-spectrum-button-secondary-outline-content-color-disabled:var(
--spectrum-disabled-content-color
);--system-spectrum-button-quiet-background-color-default:transparent;--system-spectrum-button-quiet-background-color-hover:var(
--spectrum-gray-200
);--system-spectrum-button-quiet-background-color-down:var(
--spectrum-gray-300
);--system-spectrum-button-quiet-background-color-focus:var(
--spectrum-gray-200
);--system-spectrum-button-quiet-border-color-default:transparent;--system-spectrum-button-quiet-border-color-hover:transparent;--system-spectrum-button-quiet-border-color-down:transparent;--system-spectrum-button-quiet-border-color-focus:transparent;--system-spectrum-button-quiet-background-color-disabled:transparent;--system-spectrum-button-quiet-border-color-disabled:transparent;--system-spectrum-button-selected-background-color-default:var(
--spectrum-neutral-subdued-background-color-default
);--system-spectrum-button-selected-background-color-hover:var(
--spectrum-neutral-subdued-background-color-hover
);--system-spectrum-button-selected-background-color-down:var(
--spectrum-neutral-subdued-background-color-down
);--system-spectrum-button-selected-background-color-focus:var(
--spectrum-neutral-subdued-background-color-key-focus
);--system-spectrum-button-selected-border-color-default:transparent;--system-spectrum-button-selected-border-color-hover:transparent;--system-spectrum-button-selected-border-color-down:transparent;--system-spectrum-button-selected-border-color-focus:transparent;--system-spectrum-button-selected-content-color-default:var(
--spectrum-white
);--system-spectrum-button-selected-content-color-hover:var(
--spectrum-white
);--system-spectrum-button-selected-content-color-down:var(--spectrum-white);--system-spectrum-button-selected-content-color-focus:var(
--spectrum-white
);--system-spectrum-button-selected-background-color-disabled:var(
--spectrum-disabled-background-color
);--system-spectrum-button-selected-border-color-disabled:transparent;--system-spectrum-button-selected-emphasized-background-color-default:var(
--spectrum-accent-background-color-default
);--system-spectrum-button-selected-emphasized-background-color-hover:var(
--spectrum-accent-background-color-hover
);--system-spectrum-button-selected-emphasized-background-color-down:var(
--spectrum-accent-background-color-down
);--system-spectrum-button-selected-emphasized-background-color-focus:var(
--spectrum-accent-background-color-key-focus
);--system-spectrum-button-staticblack-quiet-border-color-default:transparent;--system-spectrum-button-staticwhite-quiet-border-color-default:transparent;--system-spectrum-button-staticblack-quiet-border-color-hover:transparent;--system-spectrum-button-staticwhite-quiet-border-color-hover:transparent;--system-spectrum-button-staticblack-quiet-border-color-down:transparent;--system-spectrum-button-staticwhite-quiet-border-color-down:transparent;--system-spectrum-button-staticblack-quiet-border-color-focus:transparent;--system-spectrum-button-staticwhite-quiet-border-color-focus:transparent;--system-spectrum-button-staticblack-quiet-border-color-disabled:transparent;--system-spectrum-button-staticwhite-quiet-border-color-disabled:transparent;--system-spectrum-button-staticwhite-background-color-default:var(
--spectrum-transparent-white-800
);--system-spectrum-button-staticwhite-background-color-hover:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-background-color-down:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-background-color-focus:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-border-color-default:transparent;--system-spectrum-button-staticwhite-border-color-hover:transparent;--system-spectrum-button-staticwhite-border-color-down:transparent;--system-spectrum-button-staticwhite-border-color-focus:transparent;--system-spectrum-button-staticwhite-content-color-default:var(
--spectrum-black
);--system-spectrum-button-staticwhite-content-color-hover:var(
--spectrum-black
);--system-spectrum-button-staticwhite-content-color-down:var(
--spectrum-black
);--system-spectrum-button-staticwhite-content-color-focus:var(
--spectrum-black
);--system-spectrum-button-staticwhite-focus-indicator-color:var(
--spectrum-static-white-focus-indicator-color
);--system-spectrum-button-staticwhite-background-color-disabled:var(
--spectrum-disabled-static-white-background-color
);--system-spectrum-button-staticwhite-border-color-disabled:transparent;--system-spectrum-button-staticwhite-content-color-disabled:var(
--spectrum-disabled-static-white-content-color
);--system-spectrum-button-staticwhite-outline-background-color-default:transparent;--system-spectrum-button-staticwhite-outline-background-color-hover:var(
--spectrum-transparent-white-300
);--system-spectrum-button-staticwhite-outline-background-color-down:var(
--spectrum-transparent-white-400
);--system-spectrum-button-staticwhite-outline-background-color-focus:var(
--spectrum-transparent-white-300
);--system-spectrum-button-staticwhite-outline-border-color-default:var(
--spectrum-transparent-white-800
);--system-spectrum-button-staticwhite-outline-border-color-hover:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-outline-border-color-down:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-outline-border-color-focus:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-outline-content-color-default:var(
--spectrum-white
);--system-spectrum-button-staticwhite-outline-content-color-hover:var(
--spectrum-white
);--system-spectrum-button-staticwhite-outline-content-color-down:var(
--spectrum-white
);--system-spectrum-button-staticwhite-outline-content-color-focus:var(
--spectrum-white
);--system-spectrum-button-staticwhite-outline-focus-indicator-color:var(
--spectrum-static-white-focus-indicator-color
);--system-spectrum-button-staticwhite-outline-background-color-disabled:transparent;--system-spectrum-button-staticwhite-outline-border-color-disabled:var(
--spectrum-disabled-static-white-border-color
);--system-spectrum-button-staticwhite-outline-content-color-disabled:var(
--spectrum-disabled-static-white-content-color
);--system-spectrum-button-staticwhite-selected-background-color-default:var(
--spectrum-transparent-white-800
);--system-spectrum-button-staticwhite-selected-background-color-hover:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-selected-background-color-down:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-selected-background-color-focus:var(
--spectrum-transparent-white-900
);--system-spectrum-button-staticwhite-selected-content-color-default:var(
--spectrum-black
);--system-spectrum-button-staticwhite-selected-content-color-hover:var(
--spectrum-black
);--system-spectrum-button-staticwhite-selected-content-color-down:var(
--spectrum-black
);--system-spectrum-button-staticwhite-selected-content-color-focus:var(
--spectrum-black
);--system-spectrum-button-staticwhite-selected-background-color-disabled:var(
--spectrum-disabled-static-white-background-color
);--system-spectrum-button-staticwhite-selected-border-color-disabled:transparent;--system-spectrum-button-staticwhite-secondary-background-color-default:var(
--spectrum-transparent-white-200
);--system-spectrum-button-staticwhite-secondary-background-color-hover:var(
--spectrum-transparent-white-300
);--system-spectrum-button-staticwhite-secondary-background-color-down:var(
--spectrum-transparent-white-400
);--system-spectrum-button-staticwhite-secondary-background-color-focus:var(
--spectrum-transparent-white-300
);--system-spectrum-button-staticwhite-secondary-border-color-default:transparent;--system-spectrum-button-staticwhite-secondary-border-color-hover:transparent;--system-spectrum-button-staticwhite-secondary-border-color-down:transparent;--system-spectrum-button-staticwhite-secondary-border-color-focus:transparent;--system-spectrum-button-staticwhite-secondary-content-color-default:var(
--spectrum-white
);--system-spectrum-button-staticwhite-secondary-content-color-hover:var(
--spectrum-white
);--system-spectrum-button-staticwhite-secondary-content-color-down:var(
--spectrum-white
);--system-spectrum-button-staticwhite-secondary-content-color-focus:var(
--spectrum-white
);--system-spectrum-button-staticwhite-secondary-focus-indicator-color:var(
--spectrum-static-white-focus-indicator-color
);--system-spectrum-button-staticwhite-secondary-background-color-disabled:var(
--spectrum-disabled-static-white-background-color
);--system-spectrum-button-staticwhite-secondary-border-color-disabled:transparent;--system-spectrum-button-staticwhite-secondary-content-color-disabled:var(
--spectrum-disabled-static-white-content-color
);--system-spectrum-button-staticwhite-secondary-outline-background-color-default:transparent;--system-spectrum-button-staticwhite-secondary-outline-background-color-hover:var(
--spectrum-transparent-white-300
);--system-spectrum-button-staticwhite-secondary-outline-background-color-down:var(
--spectrum-transparent-white-400
);--system-spectrum-button-staticwhite-secondary-outline-background-color-focus:var(
--spectrum-transparent-white-300
);--system-spectrum-button-staticwhite-secondary-outline-border-color-default:var(
--spectrum-transparent-white-300
);--system-spectrum-button-staticwhite-secondary-outline-border-color-hover:var(
--spectrum-transparent-white-400
);--system-spectrum-button-staticwhite-secondary-outline-border-color-down:var(
--spectrum-transparent-white-500
);--system-spectrum-button-staticwhite-secondary-outline-border-color-focus:var(
--spectrum-transparent-white-400
);--system-spectrum-button-staticwhite-secondary-outline-content-color-default:var(
--spectrum-white
);--system-spectrum-button-staticwhite-secondary-outline-content-color-hover:var(
--spectrum-white
);--system-spectrum-button-staticwhite-secondary-outline-content-color-down:var(
--spectrum-white
);--system-spectrum-button-staticwhite-secondary-outline-content-color-focus:var(
--spectrum-white
);--system-spectrum-button-staticwhite-secondary-outline-focus-indicator-color:var(
--spectrum-static-white-focus-indicator-color
);--system-spectrum-button-staticwhite-secondary-outline-background-color-disabled:transparent;--system-spectrum-button-staticwhite-secondary-outline-border-color-disabled:var(
--spectrum-disabled-static-white-border-color
);--system-spectrum-button-staticwhite-secondary-outline-content-color-disabled:var(
--spectrum-disabled-static-white-content-color
);--system-spectrum-button-staticblack-background-color-default:var(
--spectrum-transparent-black-800
);--system-spectrum-button-staticblack-background-color-hover:var(
--spectrum-transparent-black-900
);--system-spectrum-button-staticblack-background-color-down:var(
--spectrum-transparent-black-900
);--system-spectrum-button-staticblack-background-color-focus:var(
--spectrum-transparent-black-900
);--system-spectrum-button-staticblack-border-color-default:transparent;--system-spectrum-button-staticblack-border-color-hover:transparent;--system-spectrum-button-staticblack-border-color-down:transparent;--system-spectrum-button-staticblack-border-color-focus:transparent;--system-spectrum-button-staticblack-content-color-default:var(
--spectrum-white
);--system-spectrum-button-staticblack-content-color-hover:var(
--spectrum-white
);--system-spectrum-button-staticblack-content-color-down:var(
--spectrum-white
);--system-spectrum-button-staticblack-content-color-focus:var(
--spectrum-white
);--system-spectrum-button-staticblack-focus-indicator-color:var(
--spectrum-static-black-focus-indicator-color
);--system-spectrum-button-staticblack-background-color-disabled:var(
--spectrum-disabled-static-black-background-color
);--system-spectrum-button-staticblack-border-color-disabled:transparent;--system-spectrum-button-staticblack-content-color-disabled:var(
--spectrum-disabled-static-black-content-color
);--system-spectrum-button-staticblack-outline-background-color-default:transparent;--system-spectrum-button-staticblack-outline-background-color-hover:var(
--spectrum-transparent-black-300
);--system-spectrum-button-staticblack-outline-background-color-down:var(
--spectrum-transparent-black-400
);--system-spectrum-button-staticblack-outline-background-color-focus:var(
--spectrum-transparent-black-300
);--system-spectrum-button-staticblack-outline-border-color-default:var(
--spectrum-transparent-black-400
);--system-spectrum-button-staticblack-outline-border-color-hover:var(
--spectrum-transparent-black-500
);--system-spectrum-button-staticblack-outline-border-color-down:var(
--spectrum-transparent-black-600
);--system-spectrum-button-staticblack-outline-border-color-focus:var(
--spectrum-transparent-black-500
);--system-spectrum-button-staticblack-outline-content-color-default:var(
--spectrum-black
);--system-spectrum-button-staticblack-outline-content-color-hover:var(
--spectrum-black
);--system-spectrum-button-staticblack-outline-content-color-down:var(
--spectrum-black
);--system-spectrum-button-staticblack-outline-content-color-focus:var(
--spectrum-black
);--system-spectrum-button-staticblack-outline-focus-indicator-color:var(
--spectrum-static-black-focus-indicator-color
);--system-spectrum-button-staticblack-outline-background-color-disabled:transparent;--system-spectrum-button-staticblack-outline-border-color-disabled:var(
--spectrum-disabled-static-black-border-color
);--system-spectrum-button-staticblack-outline-content-color-disabled:var(
--spectrum-disabled-static-black-content-color
);--system-spectrum-button-staticblack-secondary-background-color-default:var(
--spectrum-transparent-black-200
);--system-spectrum-button-staticblack-secondary-background-color-hover:var(
--spectrum-transparent-black-300
);--system-spectrum-button-staticblack-secondary-background-color-down:var(
--spectrum-transparent-black-400
);--system-spectrum-button-staticblack-secondary-background-color-focus:var(
--spectrum-transparent-black-300
);--system-spectrum-button-staticblack-secondary-border-color-default:transparent;--system-spectrum-button-staticblack-secondary-border-color-hover:transparent;--system-spectrum-button-staticblack-secondary-border-color-down:transparent;--system-spectrum-button-staticblack-secondary-border-color-focus:transparent;--system-spectrum-button-staticblack-secondary-content-color-default:var(
--spectrum-black
);--system-spectrum-button-staticblack-secondary-content-color-hover:var(
--spectrum-black
);--system-spectrum-button-staticblack-secondary-content-color-down:var(
--spectrum-black
);--system-spectrum-button-staticblack-secondary-content-color-focus:var(
--spectrum-black
);--system-spectrum-button-staticblack-secondary-focus-indicator-color:var(
--spectrum-static-black-focus-indicator-color
);--system-spectrum-button-staticblack-secondary-background-color-disabled:var(
--spectrum-disabled-static-black-background-color
);--system-spectrum-button-staticblack-secondary-border-color-disabled:transparent;--system-spectrum-button-staticblack-secondary-content-color-disabled:var(
--spectrum-disabled-static-black-content-color
);--system-spectrum-button-staticblack-secondary-outline-background-color-default:transparent;--system-spectrum-button-staticblack-secondary-outline-background-color-hover:var(
--spectrum-transparent-black-300
);--system-spectrum-button-staticblack-secondary-outline-background-color-down:var(
--spectrum-transparent-black-400
);--system-spectrum-button-staticblack-secondary-outline-background-color-focus:var(
--spectrum-transparent-black-300
);--system-spectrum-button-staticblack-secondary-outline-border-color-default:var(
--spectrum-transparent-black-300
);--system-spectrum-button-staticblack-secondary-outline-border-color-hover:var(
--spectrum-transparent-black-400
);--system-spectrum-button-staticblack-secondary-outline-border-color-down:var(
--spectrum-transparent-black-500
);--system-spectrum-button-staticblack-secondary-outline-border-color-focus:var(
--spectrum-transparent-black-400
);--system-spectrum-button-staticblack-secondary-outline-content-color-default:var(
--spectrum-black
);--system-spectrum-button-staticblack-secondary-outline-content-color-hover:var(
--spectrum-black
);--system-spectrum-button-staticblack-secondary-outline-content-color-down:var(
--spectrum-black
);--system-spectrum-button-staticblack-secondary-outline-content-color-focus:var(
--spectrum-black
);--system-spectrum-button-staticblack-secondary-outline-focus-indicator-color:var(
--spectrum-static-black-focus-indicator-color
);--system-spectrum-button-staticblack-secondary-outline-background-color-disabled:transparent;--system-spectrum-button-staticblack-secondary-outline-border-color-disabled:var(
--spectrum-disabled-static-black-border-color
);--system-spectrum-button-staticblack-secondary-outline-content-color-disabled:var(
--spectrum-disabled-static-black-content-color
)}:host,:root{--system-spectrum-closebutton-background-color-default:transparent;--system-spectrum-closebutton-background-color-hover:var(
--spectrum-gray-200
);--system-spectrum-closebutton-background-color-down:var(
--spectrum-gray-300
);--system-spectrum-closebutton-background-color-focus:var(
--spectrum-gray-200
)}:host,:root{--system-spectrum-radio-button-border-color-default:var(
--spectrum-gray-600
);--system-spectrum-radio-button-border-color-hover:var(--spectrum-gray-700);--system-spectrum-radio-button-border-color-down:var(--spectrum-gray-800);--system-spectrum-radio-button-border-color-focus:var(--spectrum-gray-700);--system-spectrum-radio-button-checked-border-color-default:var(
--spectrum-gray-700
);--system-spectrum-radio-button-checked-border-color-hover:var(
--spectrum-gray-800
);--system-spectrum-radio-button-checked-border-color-down:var(
--spectrum-gray-900
);--system-spectrum-radio-button-checked-border-color-focus:var(
--spectrum-gray-800
);--system-spectrum-radio-emphasized-button-checked-border-color-default:var(
--spectrum-accent-color-900
);--system-spectrum-radio-emphasized-button-checked-border-color-hover:var(
--spectrum-accent-color-1000
);--system-spectrum-radio-emphasized-button-checked-border-color-down:var(
--spectrum-accent-color-1100
);--system-spectrum-radio-emphasized-button-checked-border-color-focus:var(
--spectrum-accent-color-1000
)}:host,:root{--system-spectrum-switch-background-color-selected-default:var(
--spectrum-gray-700
);--system-spectrum-switch-background-color-selected-hover:var(
--spectrum-gray-800
);--system-spectrum-switch-background-color-selected-down:var(
--spectrum-gray-900
);--system-spectrum-switch-background-color-selected-focus:var(
--spectrum-gray-800
);--system-spectrum-switch-handle-border-color-default:var(
--spectrum-gray-600
);--system-spectrum-switch-handle-border-color-hover:var(
--spectrum-gray-700
);--system-spectrum-switch-handle-border-color-down:var(--spectrum-gray-800);--system-spectrum-switch-handle-border-color-focus:var(
--spectrum-gray-700
);--system-spectrum-switch-handle-border-color-selected-default:var(
--spectrum-gray-700
);--system-spectrum-switch-handle-border-color-selected-hover:var(
--spectrum-gray-800
);--system-spectrum-switch-handle-border-color-selected-down:var(
--spectrum-gray-900
);--system-spectrum-switch-handle-border-color-selected-focus:var(
--spectrum-gray-800
)}:host,:root{--system-spectrum-toast-background-color-default:var(
--spectrum-neutral-subdued-background-color-default
)}:host,:root{--system-spectrum-actiongroup-gap-size-compact:0;--system-spectrum-actiongroup-horizontal-spacing-compact:-1px;--system-spectrum-actiongroup-vertical-spacing-compact:-1px}:host,:root{--system-spectrum-tag-border-color:var(--spectrum-gray-700);--system-spectrum-tag-border-color-hover:var(--spectrum-gray-800);--system-spectrum-tag-border-color-active:var(--spectrum-gray-900);--system-spectrum-tag-border-color-focus:var(--spectrum-gray-800);--system-spectrum-tag-size-small-corner-radius:var(
--spectrum-corner-radius-100
);--system-spectrum-tag-size-medium-corner-radius:var(
--spectrum-corner-radius-100
);--system-spectrum-tag-size-large-corner-radius:var(
--spectrum-corner-radius-100
);--system-spectrum-tag-background-color:var(--spectrum-gray-75);--system-spectrum-tag-background-color-hover:var(--spectrum-gray-75);--system-spectrum-tag-background-color-active:var(--spectrum-gray-200);--system-spectrum-tag-background-color-focus:var(--spectrum-gray-75);--system-spectrum-tag-content-color:var(
--spectrum-neutral-subdued-content-color-default
);--system-spectrum-tag-content-color-hover:var(
--spectrum-neutral-subdued-content-color-hover
);--system-spectrum-tag-content-color-active:var(
--spectrum-neutral-subdued-content-color-down
);--system-spectrum-tag-content-color-focus:var(
--spectrum-neutral-subdued-content-color-key-focus
);--system-spectrum-tag-border-color-selected:var(
--spectrum-neutral-subdued-background-color-default
);--system-spectrum-tag-border-color-selected-hover:var(
--spectrum-neutral-subdued-background-color-hover
);--system-spectrum-tag-border-color-selected-active:var(
--spectrum-neutral-subdued-background-color-down
);--system-spectrum-tag-border-color-selected-focus:var(
--spectrum-neutral-subdued-background-color-key-focus
);--system-spectrum-tag-background-color-selected:var(
--spectrum-neutral-subdued-background-color-default
);--system-spectrum-tag-background-color-selected-hover:var(
--spectrum-neutral-subdued-background-color-hover
);--system-spectrum-tag-background-color-selected-active:var(
--spectrum-neutral-subdued-background-color-down
);--system-spectrum-tag-background-color-selected-focus:var(
--spectrum-neutral-subdued-background-color-key-focus
);--system-spectrum-tag-border-color-disabled:transparent;--system-spectrum-tag-background-color-disabled:var(
--spectrum-disabled-background-color
);--system-spectrum-tag-size-small-spacing-inline-start:var(
--spectrum-component-edge-to-visual-75
);--system-spectrum-tag-size-small-label-spacing-inline-end:var(
--spectrum-component-edge-to-text-75
);--system-spectrum-tag-size-small-clear-button-spacing-inline-end:var(
--spectrum-component-edge-to-visual-75
);--system-spectrum-tag-size-medium-spacing-inline-start:var(
--spectrum-component-edge-to-visual-100
);--system-spectrum-tag-size-medium-label-spacing-inline-end:var(
--spectrum-component-edge-to-text-100
);--system-spectrum-tag-size-medium-clear-button-spacing-inline-end:var(
--spectrum-component-edge-to-visual-100
);--system-spectrum-tag-size-large-spacing-inline-start:var(
--spectrum-component-edge-to-visual-200
);--system-spectrum-tag-size-large-label-spacing-inline-end:var(
--spectrum-component-edge-to-text-200
);--system-spectrum-tag-size-large-clear-button-spacing-inline-end:var(
--spectrum-component-edge-to-visual-200
)}:host,:root{--system-spectrum-tooltip-backgound-color-default-neutral:var(
--spectrum-neutral-subdued-background-color-default
)}:host,:root{--system-spectrum-picker-background-color-default:var(--spectrum-gray-75);--system-spectrum-picker-background-color-default-open:var(
--spectrum-gray-200
);--system-spectrum-picker-background-color-active:var(--spectrum-gray-300);--system-spectrum-picker-background-color-hover:var(--spectrum-gray-200);--system-spectrum-picker-background-color-hover-open:var(
--spectrum-gray-200
);--system-spectrum-picker-background-color-key-focus:var(
--spectrum-gray-200
);--system-spectrum-picker-border-color-default:var(--spectrum-gray-400);--system-spectrum-picker-border-color-default-open:var(
--spectrum-gray-400
);--system-spectrum-picker-border-color-hover:var(--spectrum-gray-500);--system-spectrum-picker-border-color-hover-open:var(--spectrum-gray-500);--system-spectrum-picker-border-color-active:var(--spectrum-gray-600);--system-spectrum-picker-border-color-key-focus:var(--spectrum-gray-500)}:host,:root{--system:spectrum}:host,:root{--spectrum-animation-linear:cubic-bezier(0,0,1,1);--spectrum-animation-duration-0:0ms;--spectrum-animation-duration-100:130ms;--spectrum-animation-duration-200:160ms;--spectrum-animation-duration-300:190ms;--spectrum-animation-duration-400:220ms;--spectrum-animation-duration-500:250ms;--spectrum-animation-duration-600:300ms;--spectrum-animation-duration-700:350ms;--spectrum-animation-duration-800:400ms;--spectrum-animation-duration-900:450ms;--spectrum-animation-duration-1000:500ms;--spectrum-animation-duration-2000:1000ms;--spectrum-animation-duration-4000:2000ms;--spectrum-animation-ease-in-out:cubic-bezier(0.45,0,0.4,1);--spectrum-animation-ease-in:cubic-bezier(0.5,0,1,1);--spectrum-animation-ease-out:cubic-bezier(0,0,0.4,1);--spectrum-animation-ease-linear:cubic-bezier(0,0,1,1);--spectrum-sans-serif-font:var(--spectrum-sans-serif-font-family);--spectrum-sans-font-family-stack:var(--spectrum-sans-serif-font),adobe-clean,"Source Sans Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Trebuchet MS","Lucida Grande",sans-serif;--spectrum-serif-font:var(--spectrum-serif-font-family);--spectrum-serif-font-family-stack:var(--spectrum-serif-font),adobe-clean-serif,"Source Serif Pro",Georgia,serif;--spectrum-code-font-family-stack:"Source Code Pro",Monaco,monospace;--spectrum-cjk-font:var(--spectrum-cjk-font-family);--spectrum-cjk-font-family-stack:var(--spectrum-cjk-font),adobe-clean-han-japanese,sans-serif;--spectrum-docs-static-white-background-color:#0f797d;--spectrum-docs-static-black-background-color:#cef7f3}:host,:root{font-family:var(--spectrum-alias-body-text-font-family);font-size:var(--spectrum-alias-font-size-default)}:host:lang(ar),:root:lang(ar){font-family:var(--spectrum-alias-font-family-ar)}:host:lang(he),:root:lang(he){font-family:var(--spectrum-alias-font-family-he)}:host:lang(zh-Hans),:root:lang(zh-Hans){font-family:var(--spectrum-alias-font-family-zhhans)}:host:lang(zh-Hant),:root:lang(zh-Hant){font-family:var(--spectrum-alias-font-family-zh)}:host:lang(zh),:root:lang(zh){font-family:var(--spectrum-alias-font-family-zh)}:host:lang(ko),:root:lang(ko){font-family:var(--spectrum-alias-font-family-ko)}:host:lang(ja),:root:lang(ja){font-family:var(--spectrum-alias-font-family-ja)}:host{display:block}#scale,#theme{height:100%;width:100%}
`;N.registerThemeFragment("spectrum","theme",Yr),N.registerThemeFragment("dark","color",Qr);var Jr=p`
:host,:root{--spectrum-global-color-status:Verified;--spectrum-global-color-version:5.1.0;--spectrum-global-color-opacity-100:1;--spectrum-global-color-opacity-90:0.9;--spectrum-global-color-opacity-80:0.8;--spectrum-global-color-opacity-70:0.7;--spectrum-global-color-opacity-60:0.6;--spectrum-global-color-opacity-55:0.55;--spectrum-global-color-opacity-50:0.5;--spectrum-global-color-opacity-42:0.42;--spectrum-global-color-opacity-40:0.4;--spectrum-global-color-opacity-30:0.3;--spectrum-global-color-opacity-25:0.25;--spectrum-global-color-opacity-20:0.2;--spectrum-global-color-opacity-15:0.15;--spectrum-global-color-opacity-10:0.1;--spectrum-global-color-opacity-8:0.08;--spectrum-global-color-opacity-7:0.07;--spectrum-global-color-opacity-6:0.06;--spectrum-global-color-opacity-5:0.05;--spectrum-global-color-opacity-4:0.04;--spectrum-global-color-opacity-0:0;--spectrum-global-color-celery-400-rgb:39,187,54;--spectrum-global-color-celery-400:rgb(var(--spectrum-global-color-celery-400-rgb));--spectrum-global-color-celery-500-rgb:7,167,33;--spectrum-global-color-celery-500:rgb(var(--spectrum-global-color-celery-500-rgb));--spectrum-global-color-celery-600-rgb:0,145,18;--spectrum-global-color-celery-600:rgb(var(--spectrum-global-color-celery-600-rgb));--spectrum-global-color-celery-700-rgb:0,124,15;--spectrum-global-color-celery-700:rgb(var(--spectrum-global-color-celery-700-rgb));--spectrum-global-color-chartreuse-400-rgb:152,197,10;--spectrum-global-color-chartreuse-400:rgb(var(--spectrum-global-color-chartreuse-400-rgb));--spectrum-global-color-chartreuse-500-rgb:135,177,3;--spectrum-global-color-chartreuse-500:rgb(var(--spectrum-global-color-chartreuse-500-rgb));--spectrum-global-color-chartreuse-600-rgb:118,156,0;--spectrum-global-color-chartreuse-600:rgb(var(--spectrum-global-color-chartreuse-600-rgb));--spectrum-global-color-chartreuse-700-rgb:103,136,0;--spectrum-global-color-chartreuse-700:rgb(var(--spectrum-global-color-chartreuse-700-rgb));--spectrum-global-color-yellow-400-rgb:232,198,0;--spectrum-global-color-yellow-400:rgb(var(--spectrum-global-color-yellow-400-rgb));--spectrum-global-color-yellow-500-rgb:215,179,0;--spectrum-global-color-yellow-500:rgb(var(--spectrum-global-color-yellow-500-rgb));--spectrum-global-color-yellow-600-rgb:196,159,0;--spectrum-global-color-yellow-600:rgb(var(--spectrum-global-color-yellow-600-rgb));--spectrum-global-color-yellow-700-rgb:176,140,0;--spectrum-global-color-yellow-700:rgb(var(--spectrum-global-color-yellow-700-rgb));--spectrum-global-color-magenta-400-rgb:222,61,130;--spectrum-global-color-magenta-400:rgb(var(--spectrum-global-color-magenta-400-rgb));--spectrum-global-color-magenta-500-rgb:200,34,105;--spectrum-global-color-magenta-500:rgb(var(--spectrum-global-color-magenta-500-rgb));--spectrum-global-color-magenta-600-rgb:173,9,85;--spectrum-global-color-magenta-600:rgb(var(--spectrum-global-color-magenta-600-rgb));--spectrum-global-color-magenta-700-rgb:142,0,69;--spectrum-global-color-magenta-700:rgb(var(--spectrum-global-color-magenta-700-rgb));--spectrum-global-color-fuchsia-400-rgb:205,58,206;--spectrum-global-color-fuchsia-400:rgb(var(--spectrum-global-color-fuchsia-400-rgb));--spectrum-global-color-fuchsia-500-rgb:182,34,183;--spectrum-global-color-fuchsia-500:rgb(var(--spectrum-global-color-fuchsia-500-rgb));--spectrum-global-color-fuchsia-600-rgb:157,3,158;--spectrum-global-color-fuchsia-600:rgb(var(--spectrum-global-color-fuchsia-600-rgb));--spectrum-global-color-fuchsia-700-rgb:128,0,129;--spectrum-global-color-fuchsia-700:rgb(var(--spectrum-global-color-fuchsia-700-rgb));--spectrum-global-color-purple-400-rgb:157,87,244;--spectrum-global-color-purple-400:rgb(var(--spectrum-global-color-purple-400-rgb));--spectrum-global-color-purple-500-rgb:137,61,231;--spectrum-global-color-purple-500:rgb(var(--spectrum-global-color-purple-500-rgb));--spectrum-global-color-purple-600-rgb:115,38,211;--spectrum-global-color-purple-600:rgb(var(--spectrum-global-color-purple-600-rgb));--spectrum-global-color-purple-700-rgb:93,19,183;--spectrum-global-color-purple-700:rgb(var(--spectrum-global-color-purple-700-rgb));--spectrum-global-color-indigo-400-rgb:104,109,244;--spectrum-global-color-indigo-400:rgb(var(--spectrum-global-color-indigo-400-rgb));--spectrum-global-color-indigo-500-rgb:82,88,228;--spectrum-global-color-indigo-500:rgb(var(--spectrum-global-color-indigo-500-rgb));--spectrum-global-color-indigo-600-rgb:64,70,202;--spectrum-global-color-indigo-600:rgb(var(--spectrum-global-color-indigo-600-rgb));--spectrum-global-color-indigo-700-rgb:50,54,168;--spectrum-global-color-indigo-700:rgb(var(--spectrum-global-color-indigo-700-rgb));--spectrum-global-color-seafoam-400-rgb:0,161,154;--spectrum-global-color-seafoam-400:rgb(var(--spectrum-global-color-seafoam-400-rgb));--spectrum-global-color-seafoam-500-rgb:0,140,135;--spectrum-global-color-seafoam-500:rgb(var(--spectrum-global-color-seafoam-500-rgb));--spectrum-global-color-seafoam-600-rgb:0,119,114;--spectrum-global-color-seafoam-600:rgb(var(--spectrum-global-color-seafoam-600-rgb));--spectrum-global-color-seafoam-700-rgb:0,99,95;--spectrum-global-color-seafoam-700:rgb(var(--spectrum-global-color-seafoam-700-rgb));--spectrum-global-color-red-400-rgb:234,56,41;--spectrum-global-color-red-400:rgb(var(--spectrum-global-color-red-400-rgb));--spectrum-global-color-red-500-rgb:211,21,16;--spectrum-global-color-red-500:rgb(var(--spectrum-global-color-red-500-rgb));--spectrum-global-color-red-600-rgb:180,0,0;--spectrum-global-color-red-600:rgb(var(--spectrum-global-color-red-600-rgb));--spectrum-global-color-red-700-rgb:147,0,0;--spectrum-global-color-red-700:rgb(var(--spectrum-global-color-red-700-rgb));--spectrum-global-color-orange-400-rgb:246,133,17;--spectrum-global-color-orange-400:rgb(var(--spectrum-global-color-orange-400-rgb));--spectrum-global-color-orange-500-rgb:228,111,0;--spectrum-global-color-orange-500:rgb(var(--spectrum-global-color-orange-500-rgb));--spectrum-global-color-orange-600-rgb:203,93,0;--spectrum-global-color-orange-600:rgb(var(--spectrum-global-color-orange-600-rgb));--spectrum-global-color-orange-700-rgb:177,76,0;--spectrum-global-color-orange-700:rgb(var(--spectrum-global-color-orange-700-rgb));--spectrum-global-color-green-400-rgb:0,143,93;--spectrum-global-color-green-400:rgb(var(--spectrum-global-color-green-400-rgb));--spectrum-global-color-green-500-rgb:0,122,77;--spectrum-global-color-green-500:rgb(var(--spectrum-global-color-green-500-rgb));--spectrum-global-color-green-600-rgb:0,101,62;--spectrum-global-color-green-600:rgb(var(--spectrum-global-color-green-600-rgb));--spectrum-global-color-green-700-rgb:0,81,50;--spectrum-global-color-green-700:rgb(var(--spectrum-global-color-green-700-rgb));--spectrum-global-color-blue-400-rgb:20,122,243;--spectrum-global-color-blue-400:rgb(var(--spectrum-global-color-blue-400-rgb));--spectrum-global-color-blue-500-rgb:2,101,220;--spectrum-global-color-blue-500:rgb(var(--spectrum-global-color-blue-500-rgb));--spectrum-global-color-blue-600-rgb:0,84,182;--spectrum-global-color-blue-600:rgb(var(--spectrum-global-color-blue-600-rgb));--spectrum-global-color-blue-700-rgb:0,68,145;--spectrum-global-color-blue-700:rgb(var(--spectrum-global-color-blue-700-rgb));--spectrum-global-color-gray-50-rgb:255,255,255;--spectrum-global-color-gray-50:rgb(var(--spectrum-global-color-gray-50-rgb));--spectrum-global-color-gray-75-rgb:253,253,253;--spectrum-global-color-gray-75:rgb(var(--spectrum-global-color-gray-75-rgb));--spectrum-global-color-gray-100-rgb:248,248,248;--spectrum-global-color-gray-100:rgb(var(--spectrum-global-color-gray-100-rgb));--spectrum-global-color-gray-200-rgb:230,230,230;--spectrum-global-color-gray-200:rgb(var(--spectrum-global-color-gray-200-rgb));--spectrum-global-color-gray-300-rgb:213,213,213;--spectrum-global-color-gray-300:rgb(var(--spectrum-global-color-gray-300-rgb));--spectrum-global-color-gray-400-rgb:177,177,177;--spectrum-global-color-gray-400:rgb(var(--spectrum-global-color-gray-400-rgb));--spectrum-global-color-gray-500-rgb:144,144,144;--spectrum-global-color-gray-500:rgb(var(--spectrum-global-color-gray-500-rgb));--spectrum-global-color-gray-600-rgb:109,109,109;--spectrum-global-color-gray-600:rgb(var(--spectrum-global-color-gray-600-rgb));--spectrum-global-color-gray-700-rgb:70,70,70;--spectrum-global-color-gray-700:rgb(var(--spectrum-global-color-gray-700-rgb));--spectrum-global-color-gray-800-rgb:34,34,34;--spectrum-global-color-gray-800:rgb(var(--spectrum-global-color-gray-800-rgb));--spectrum-global-color-gray-900-rgb:0,0,0;--spectrum-global-color-gray-900:rgb(var(--spectrum-global-color-gray-900-rgb));--spectrum-alias-background-color-primary:var(
--spectrum-global-color-gray-50
);--spectrum-alias-background-color-secondary:var(
--spectrum-global-color-gray-100
);--spectrum-alias-background-color-tertiary:var(
--spectrum-global-color-gray-300
);--spectrum-alias-background-color-modal-overlay:rgba(0,0,0,.4);--spectrum-alias-dropshadow-color:rgba(0,0,0,.15);--spectrum-alias-background-color-hover-overlay:rgba(0,0,0,.04);--spectrum-alias-highlight-hover:rgba(0,0,0,.06);--spectrum-alias-highlight-down:rgba(0,0,0,.1);--spectrum-alias-highlight-selected:rgba(2,101,220,.1);--spectrum-alias-highlight-selected-hover:rgba(2,101,220,.2);--spectrum-alias-text-highlight-color:rgba(2,101,220,.2);--spectrum-alias-background-color-quickactions:hsla(0,0%,97%,.9);--spectrum-alias-border-color-selected:var(
--spectrum-global-color-blue-500
);--spectrum-alias-border-color-translucent:rgba(0,0,0,.1);--spectrum-alias-radial-reaction-color-default:rgba(34,34,34,.6);--spectrum-alias-pasteboard-background-color:var(
--spectrum-global-color-gray-300
);--spectrum-alias-appframe-border-color:var(
--spectrum-global-color-gray-300
);--spectrum-alias-appframe-separator-color:var(
--spectrum-global-color-gray-300
);--spectrum-scrollbar-mac-s-track-background-color:var(
--spectrum-global-color-gray-75
);--spectrum-scrollbar-mac-m-track-background-color:var(
--spectrum-global-color-gray-75
);--spectrum-scrollbar-mac-l-track-background-color:var(
--spectrum-global-color-gray-75
);--spectrum-slider-s-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-ramp-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-range-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-ramp-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-range-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-ramp-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-range-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-ramp-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-s-range-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-ramp-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-range-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-ramp-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-range-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-ramp-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-range-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-ramp-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-m-range-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-ramp-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-range-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-ramp-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-range-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-ramp-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-range-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-ramp-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-l-range-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-ramp-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-range-tick-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-ramp-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-range-tick-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-ramp-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-range-editable-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-ramp-radial-reaction-color:rgba(34,34,34,.6);--spectrum-slider-xl-range-radial-reaction-color:rgba(34,34,34,.6);--spectrum-well-background-color:rgba(34,34,34,.02)}:host,:root{color-scheme:light}:host,:root{--spectrum-overlay-opacity:0.4;--spectrum-drop-shadow-color:rgba(0,0,0,.15);--spectrum-background-base-color:var(--spectrum-gray-200);--spectrum-background-layer-1-color:var(--spectrum-gray-100);--spectrum-background-layer-2-color:var(--spectrum-gray-50);--spectrum-neutral-background-color-default:var(--spectrum-gray-800);--spectrum-neutral-background-color-hover:var(--spectrum-gray-900);--spectrum-neutral-background-color-down:var(--spectrum-gray-900);--spectrum-neutral-background-color-key-focus:var(--spectrum-gray-900);--spectrum-neutral-subdued-background-color-default:var(
--spectrum-gray-600
);--spectrum-neutral-subdued-background-color-hover:var(--spectrum-gray-700);--spectrum-neutral-subdued-background-color-down:var(--spectrum-gray-800);--spectrum-neutral-subdued-background-color-key-focus:var(
--spectrum-gray-700
);--spectrum-accent-background-color-default:var(
--spectrum-accent-color-900
);--spectrum-accent-background-color-hover:var(--spectrum-accent-color-1000);--spectrum-accent-background-color-down:var(--spectrum-accent-color-1100);--spectrum-accent-background-color-key-focus:var(
--spectrum-accent-color-1000
);--spectrum-informative-background-color-default:var(
--spectrum-informative-color-900
);--spectrum-informative-background-color-hover:var(
--spectrum-informative-color-1000
);--spectrum-informative-background-color-down:var(
--spectrum-informative-color-1100
);--spectrum-informative-background-color-key-focus:var(
--spectrum-informative-color-1000
);--spectrum-negative-background-color-default:var(
--spectrum-negative-color-900
);--spectrum-negative-background-color-hover:var(
--spectrum-negative-color-1000
);--spectrum-negative-background-color-down:var(
--spectrum-negative-color-1100
);--spectrum-negative-background-color-key-focus:var(
--spectrum-negative-color-1000
);--spectrum-positive-background-color-default:var(
--spectrum-positive-color-900
);--spectrum-positive-background-color-hover:var(
--spectrum-positive-color-1000
);--spectrum-positive-background-color-down:var(
--spectrum-positive-color-1100
);--spectrum-positive-background-color-key-focus:var(
--spectrum-positive-color-1000
);--spectrum-notice-background-color-default:var(
--spectrum-notice-color-600
);--spectrum-gray-background-color-default:var(--spectrum-gray-700);--spectrum-red-background-color-default:var(--spectrum-red-900);--spectrum-orange-background-color-default:var(--spectrum-orange-600);--spectrum-yellow-background-color-default:var(--spectrum-yellow-400);--spectrum-chartreuse-background-color-default:var(
--spectrum-chartreuse-500
);--spectrum-celery-background-color-default:var(--spectrum-celery-600);--spectrum-green-background-color-default:var(--spectrum-green-900);--spectrum-seafoam-background-color-default:var(--spectrum-seafoam-900);--spectrum-cyan-background-color-default:var(--spectrum-cyan-900);--spectrum-blue-background-color-default:var(--spectrum-blue-900);--spectrum-indigo-background-color-default:var(--spectrum-indigo-900);--spectrum-purple-background-color-default:var(--spectrum-purple-900);--spectrum-fuchsia-background-color-default:var(--spectrum-fuchsia-900);--spectrum-magenta-background-color-default:var(--spectrum-magenta-900);--spectrum-neutral-visual-color:var(--spectrum-gray-500);--spectrum-accent-visual-color:var(--spectrum-accent-color-800);--spectrum-informative-visual-color:var(--spectrum-informative-color-800);--spectrum-negative-visual-color:var(--spectrum-negative-color-800);--spectrum-notice-visual-color:var(--spectrum-notice-color-700);--spectrum-positive-visual-color:var(--spectrum-positive-color-700);--spectrum-gray-visual-color:var(--spectrum-gray-500);--spectrum-red-visual-color:var(--spectrum-red-800);--spectrum-orange-visual-color:var(--spectrum-orange-700);--spectrum-yellow-visual-color:var(--spectrum-yellow-600);--spectrum-chartreuse-visual-color:var(--spectrum-chartreuse-600);--spectrum-celery-visual-color:var(--spectrum-celery-700);--spectrum-green-visual-color:var(--spectrum-green-700);--spectrum-seafoam-visual-color:var(--spectrum-seafoam-700);--spectrum-cyan-visual-color:var(--spectrum-cyan-600);--spectrum-blue-visual-color:var(--spectrum-blue-800);--spectrum-indigo-visual-color:var(--spectrum-indigo-800);--spectrum-purple-visual-color:var(--spectrum-purple-800);--spectrum-fuchsia-visual-color:var(--spectrum-fuchsia-800);--spectrum-magenta-visual-color:var(--spectrum-magenta-800);--spectrum-opacity-checkerboard-square-dark:var(--spectrum-gray-200);--spectrum-gray-50:#fff;--spectrum-gray-75:#fdfdfd;--spectrum-gray-100:#f8f8f8;--spectrum-gray-200:#e6e6e6;--spectrum-gray-300:#d5d5d5;--spectrum-gray-400:#b1b1b1;--spectrum-gray-500:#909090;--spectrum-gray-600:#6d6d6d;--spectrum-gray-700:#464646;--spectrum-gray-800:#222;--spectrum-gray-900:#000;--spectrum-blue-100:#e0f2ff;--spectrum-blue-200:#cae8ff;--spectrum-blue-300:#b5deff;--spectrum-blue-400:#96cefd;--spectrum-blue-500:#78bbfa;--spectrum-blue-600:#59a7f6;--spectrum-blue-700:#3892f3;--spectrum-blue-800:#147af3;--spectrum-blue-900:#0265dc;--spectrum-blue-1000:#0054b6;--spectrum-blue-1100:#004491;--spectrum-blue-1200:#003571;--spectrum-blue-1300:#002754;--spectrum-blue-1400:#001c3c;--spectrum-red-100:#ffebe7;--spectrum-red-200:#ffddd6;--spectrum-red-300:#ffcdc3;--spectrum-red-400:#ffb7a9;--spectrum-red-500:#ff9b88;--spectrum-red-600:#ff7c65;--spectrum-red-700:#f75c46;--spectrum-red-800:#ea3829;--spectrum-red-900:#d31510;--spectrum-red-1000:#b40000;--spectrum-red-1100:#930000;--spectrum-red-1200:#740000;--spectrum-red-1300:#590000;--spectrum-red-1400:#430000;--spectrum-orange-100:#ffeccc;--spectrum-orange-200:#ffdfad;--spectrum-orange-300:#fdd291;--spectrum-orange-400:#ffbb63;--spectrum-orange-500:#ffa037;--spectrum-orange-600:#f68511;--spectrum-orange-700:#e46f00;--spectrum-orange-800:#cb5d00;--spectrum-orange-900:#b14c00;--spectrum-orange-1000:#953d00;--spectrum-orange-1100:#7a2f00;--spectrum-orange-1200:#612300;--spectrum-orange-1300:#491901;--spectrum-orange-1400:#351201;--spectrum-yellow-100:#fbf198;--spectrum-yellow-200:#f8e750;--spectrum-yellow-300:#f8d904;--spectrum-yellow-400:#e8c600;--spectrum-yellow-500:#d7b300;--spectrum-yellow-600:#c49f00;--spectrum-yellow-700:#b08c00;--spectrum-yellow-800:#9b7800;--spectrum-yellow-900:#856600;--spectrum-yellow-1000:#705300;--spectrum-yellow-1100:#5b4300;--spectrum-yellow-1200:#483300;--spectrum-yellow-1300:#362500;--spectrum-yellow-1400:#281a00;--spectrum-chartreuse-100:#dbfc6e;--spectrum-chartreuse-200:#cbf443;--spectrum-chartreuse-300:#bce92a;--spectrum-chartreuse-400:#aad816;--spectrum-chartreuse-500:#98c50a;--spectrum-chartreuse-600:#87b103;--spectrum-chartreuse-700:#769c00;--spectrum-chartreuse-800:#678800;--spectrum-chartreuse-900:#577400;--spectrum-chartreuse-1000:#486000;--spectrum-chartreuse-1100:#3a4d00;--spectrum-chartreuse-1200:#2c3b00;--spectrum-chartreuse-1300:#212c00;--spectrum-chartreuse-1400:#181f00;--spectrum-celery-100:#cdfcbf;--spectrum-celery-200:#aef69d;--spectrum-celery-300:#96ee85;--spectrum-celery-400:#72e06a;--spectrum-celery-500:#4ecf50;--spectrum-celery-600:#27bb36;--spectrum-celery-700:#07a721;--spectrum-celery-800:#009112;--spectrum-celery-900:#007c0f;--spectrum-celery-1000:#00670f;--spectrum-celery-1100:#00530d;--spectrum-celery-1200:#00400a;--spectrum-celery-1300:#003007;--spectrum-celery-1400:#002205;--spectrum-green-100:#cef8e0;--spectrum-green-200:#adf4ce;--spectrum-green-300:#89ecbc;--spectrum-green-400:#67dea8;--spectrum-green-500:#49cc93;--spectrum-green-600:#2fb880;--spectrum-green-700:#15a46e;--spectrum-green-800:#008f5d;--spectrum-green-900:#007a4d;--spectrum-green-1000:#00653e;--spectrum-green-1100:#005132;--spectrum-green-1200:#053f27;--spectrum-green-1300:#0a2e1d;--spectrum-green-1400:#0a2015;--spectrum-seafoam-100:#cef7f3;--spectrum-seafoam-200:#aaf1ea;--spectrum-seafoam-300:#8ce9e2;--spectrum-seafoam-400:#65dad2;--spectrum-seafoam-500:#3fc9c1;--spectrum-seafoam-600:#0fb5ae;--spectrum-seafoam-700:#00a19a;--spectrum-seafoam-800:#008c87;--spectrum-seafoam-900:#007772;--spectrum-seafoam-1000:#00635f;--spectrum-seafoam-1100:#0c4f4c;--spectrum-seafoam-1200:#123c3a;--spectrum-seafoam-1300:#122c2b;--spectrum-seafoam-1400:#0f1f1e;--spectrum-cyan-100:#c5f8ff;--spectrum-cyan-200:#a4f0ff;--spectrum-cyan-300:#88e7fa;--spectrum-cyan-400:#60d8f3;--spectrum-cyan-500:#33c5e8;--spectrum-cyan-600:#12b0da;--spectrum-cyan-700:#019cc8;--spectrum-cyan-800:#0086b4;--spectrum-cyan-900:#00719f;--spectrum-cyan-1000:#005d89;--spectrum-cyan-1100:#004a73;--spectrum-cyan-1200:#00395d;--spectrum-cyan-1300:#002a46;--spectrum-cyan-1400:#001e33;--spectrum-indigo-100:#edeeff;--spectrum-indigo-200:#e0e2ff;--spectrum-indigo-300:#d3d5ff;--spectrum-indigo-400:#c1c4ff;--spectrum-indigo-500:#acafff;--spectrum-indigo-600:#9599ff;--spectrum-indigo-700:#7e84fc;--spectrum-indigo-800:#686df4;--spectrum-indigo-900:#5258e4;--spectrum-indigo-1000:#4046ca;--spectrum-indigo-1100:#3236a8;--spectrum-indigo-1200:#262986;--spectrum-indigo-1300:#1b1e64;--spectrum-indigo-1400:#141648;--spectrum-purple-100:#f6ebff;--spectrum-purple-200:#edf;--spectrum-purple-300:#e6d0ff;--spectrum-purple-400:#dbbbfe;--spectrum-purple-500:#cca4fd;--spectrum-purple-600:#bd8bfc;--spectrum-purple-700:#ae72f9;--spectrum-purple-800:#9d57f4;--spectrum-purple-900:#893de7;--spectrum-purple-1000:#7326d3;--spectrum-purple-1100:#5d13b7;--spectrum-purple-1200:#470c94;--spectrum-purple-1300:#33106a;--spectrum-purple-1400:#230f49;--spectrum-fuchsia-100:#ffe9fc;--spectrum-fuchsia-200:#ffdafa;--spectrum-fuchsia-300:#fec7f8;--spectrum-fuchsia-400:#fbaef6;--spectrum-fuchsia-500:#f592f3;--spectrum-fuchsia-600:#ed74ed;--spectrum-fuchsia-700:#e055e2;--spectrum-fuchsia-800:#cd3ace;--spectrum-fuchsia-900:#b622b7;--spectrum-fuchsia-1000:#9d039e;--spectrum-fuchsia-1100:#800081;--spectrum-fuchsia-1200:#640664;--spectrum-fuchsia-1300:#470e46;--spectrum-fuchsia-1400:#320d31;--spectrum-magenta-100:#ffeaf1;--spectrum-magenta-200:#ffdce8;--spectrum-magenta-300:#ffcadd;--spectrum-magenta-400:#ffb2ce;--spectrum-magenta-500:#ff95bd;--spectrum-magenta-600:#fa77aa;--spectrum-magenta-700:#ef5a98;--spectrum-magenta-800:#de3d82;--spectrum-magenta-900:#c82269;--spectrum-magenta-1000:#ad0955;--spectrum-magenta-1100:#8e0045;--spectrum-magenta-1200:#700037;--spectrum-magenta-1300:#54032a;--spectrum-magenta-1400:#3c061d}
`;N.registerThemeFragment("light","color",Jr);var to=p`
:host,:root{--spectrum-global-dimension-scale-factor:1;--spectrum-global-dimension-size-0:0px;--spectrum-global-dimension-size-10:1px;--spectrum-global-dimension-size-25:2px;--spectrum-global-dimension-size-30:2px;--spectrum-global-dimension-size-40:3px;--spectrum-global-dimension-size-50:4px;--spectrum-global-dimension-size-65:5px;--spectrum-global-dimension-size-75:6px;--spectrum-global-dimension-size-85:7px;--spectrum-global-dimension-size-100:8px;--spectrum-global-dimension-size-115:9px;--spectrum-global-dimension-size-125:10px;--spectrum-global-dimension-size-130:11px;--spectrum-global-dimension-size-150:12px;--spectrum-global-dimension-size-160:13px;--spectrum-global-dimension-size-175:14px;--spectrum-global-dimension-size-185:15px;--spectrum-global-dimension-size-200:16px;--spectrum-global-dimension-size-225:18px;--spectrum-global-dimension-size-250:20px;--spectrum-global-dimension-size-275:22px;--spectrum-global-dimension-size-300:24px;--spectrum-global-dimension-size-325:26px;--spectrum-global-dimension-size-350:28px;--spectrum-global-dimension-size-400:32px;--spectrum-global-dimension-size-450:36px;--spectrum-global-dimension-size-500:40px;--spectrum-global-dimension-size-550:44px;--spectrum-global-dimension-size-600:48px;--spectrum-global-dimension-size-650:52px;--spectrum-global-dimension-size-675:54px;--spectrum-global-dimension-size-700:56px;--spectrum-global-dimension-size-750:60px;--spectrum-global-dimension-size-800:64px;--spectrum-global-dimension-size-900:72px;--spectrum-global-dimension-size-1000:80px;--spectrum-global-dimension-size-1125:90px;--spectrum-global-dimension-size-1200:96px;--spectrum-global-dimension-size-1250:100px;--spectrum-global-dimension-size-1600:128px;--spectrum-global-dimension-size-1700:136px;--spectrum-global-dimension-size-1800:144px;--spectrum-global-dimension-size-2000:160px;--spectrum-global-dimension-size-2400:192px;--spectrum-global-dimension-size-2500:200px;--spectrum-global-dimension-size-3000:240px;--spectrum-global-dimension-size-3400:272px;--spectrum-global-dimension-size-3600:288px;--spectrum-global-dimension-size-4600:368px;--spectrum-global-dimension-size-5000:400px;--spectrum-global-dimension-size-6000:480px;--spectrum-global-dimension-font-size-25:10px;--spectrum-global-dimension-font-size-50:11px;--spectrum-global-dimension-font-size-75:12px;--spectrum-global-dimension-font-size-100:14px;--spectrum-global-dimension-font-size-150:15px;--spectrum-global-dimension-font-size-200:16px;--spectrum-global-dimension-font-size-300:18px;--spectrum-global-dimension-font-size-400:20px;--spectrum-global-dimension-font-size-500:22px;--spectrum-global-dimension-font-size-600:25px;--spectrum-global-dimension-font-size-700:28px;--spectrum-global-dimension-font-size-800:32px;--spectrum-global-dimension-font-size-900:36px;--spectrum-global-dimension-font-size-1000:40px;--spectrum-global-dimension-font-size-1100:45px;--spectrum-global-dimension-font-size-1200:50px;--spectrum-global-dimension-font-size-1300:60px;--spectrum-alias-item-text-padding-top-l:var(
--spectrum-global-dimension-size-115
);--spectrum-alias-item-text-padding-bottom-s:var(
--spectrum-global-dimension-static-size-65
);--spectrum-alias-item-workflow-padding-left-m:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-rounded-workflow-padding-left-m:var(
--spectrum-global-dimension-size-175
);--spectrum-alias-item-rounded-workflow-padding-left-xl:21px;--spectrum-alias-item-mark-padding-top-m:var(
--spectrum-global-dimension-static-size-75
);--spectrum-alias-item-mark-padding-bottom-m:var(
--spectrum-global-dimension-static-size-75
);--spectrum-alias-item-mark-padding-left-m:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-control-1-size-l:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-control-1-size-xl:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-item-control-2-size-s:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-item-control-3-height-s:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-item-control-3-width-s:23px;--spectrum-alias-item-control-3-width-m:var(
--spectrum-global-dimension-static-size-325
);--spectrum-alias-item-control-3-width-l:29px;--spectrum-alias-item-control-3-width-xl:33px;--spectrum-alias-item-mark-size-m:var(
--spectrum-global-dimension-size-250
);--spectrum-alias-component-focusring-border-radius:var(
--spectrum-global-dimension-static-size-65
);--spectrum-alias-control-two-size-s:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-control-three-height-s:var(
--spectrum-global-dimension-size-150
);--spectrum-alias-control-three-width-s:23px;--spectrum-alias-control-three-width-m:var(
--spectrum-global-dimension-static-size-325
);--spectrum-alias-control-three-width-l:29px;--spectrum-alias-control-three-width-xl:33px;--spectrum-alias-search-padding-left-m:var(
--spectrum-global-dimension-size-125
);--spectrum-alias-focus-ring-border-radius-regular:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-focus-ring-radius-default:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-workflow-icon-size-l:var(
--spectrum-global-dimension-static-size-250
);--spectrum-alias-ui-icon-chevron-size-75:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-chevron-size-100:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-chevron-size-200:var(
--spectrum-global-dimension-static-size-150
);--spectrum-alias-ui-icon-chevron-size-300:var(
--spectrum-global-dimension-static-size-175
);--spectrum-alias-ui-icon-chevron-size-400:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-ui-icon-chevron-size-500:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-ui-icon-checkmark-size-50:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-checkmark-size-75:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-checkmark-size-100:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-checkmark-size-200:var(
--spectrum-global-dimension-static-size-150
);--spectrum-alias-ui-icon-checkmark-size-300:var(
--spectrum-global-dimension-static-size-175
);--spectrum-alias-ui-icon-checkmark-size-400:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-ui-icon-checkmark-size-500:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-ui-icon-checkmark-size-600:var(
--spectrum-global-dimension-static-size-225
);--spectrum-alias-ui-icon-dash-size-50:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-ui-icon-dash-size-75:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-ui-icon-dash-size-100:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-dash-size-200:var(
--spectrum-global-dimension-static-size-150
);--spectrum-alias-ui-icon-dash-size-300:var(
--spectrum-global-dimension-static-size-150
);--spectrum-alias-ui-icon-dash-size-400:var(
--spectrum-global-dimension-static-size-175
);--spectrum-alias-ui-icon-dash-size-500:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-ui-icon-dash-size-600:var(
--spectrum-global-dimension-static-size-225
);--spectrum-alias-ui-icon-cross-size-75:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-ui-icon-cross-size-100:var(
--spectrum-global-dimension-static-size-100
);--spectrum-alias-ui-icon-cross-size-200:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-cross-size-300:var(
--spectrum-global-dimension-static-size-150
);--spectrum-alias-ui-icon-cross-size-400:var(
--spectrum-global-dimension-static-size-150
);--spectrum-alias-ui-icon-cross-size-500:var(
--spectrum-global-dimension-static-size-175
);--spectrum-alias-ui-icon-cross-size-600:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-ui-icon-arrow-size-75:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-arrow-size-100:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-arrow-size-200:var(
--spectrum-global-dimension-static-size-150
);--spectrum-alias-ui-icon-arrow-size-300:var(
--spectrum-global-dimension-static-size-175
);--spectrum-alias-ui-icon-arrow-size-400:var(
--spectrum-global-dimension-static-size-200
);--spectrum-alias-ui-icon-arrow-size-500:var(
--spectrum-global-dimension-static-size-225
);--spectrum-alias-ui-icon-arrow-size-600:var(
--spectrum-global-dimension-static-size-250
);--spectrum-alias-ui-icon-triplegripper-size-100-width:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-doublegripper-size-100-height:var(
--spectrum-global-dimension-static-size-50
);--spectrum-alias-ui-icon-singlegripper-size-100-height:var(
--spectrum-global-dimension-static-size-25
);--spectrum-alias-ui-icon-cornertriangle-size-100:var(
--spectrum-global-dimension-static-size-65
);--spectrum-alias-ui-icon-cornertriangle-size-300:var(
--spectrum-global-dimension-static-size-85
);--spectrum-alias-ui-icon-asterisk-size-200:var(
--spectrum-global-dimension-static-size-125
);--spectrum-alias-ui-icon-asterisk-size-300:var(
--spectrum-global-dimension-static-size-125
);--spectrum-dialog-confirm-title-text-size:var(
--spectrum-alias-heading-s-text-size
);--spectrum-dialog-confirm-description-text-size:var(
--spectrum-global-dimension-font-size-100
);--spectrum-dialog-confirm-padding:var(
--spectrum-global-dimension-static-size-500
);--spectrum-listitem-m-texticon-padding-left:var(
--spectrum-global-dimension-size-125
);--spectrum-listitem-m-textthumbnail-padding-left:var(
--spectrum-global-dimension-size-125
)}:host,:root{--spectrum-global-alias-appframe-border-size:2px}:host,:root{--spectrum-field-label-text-to-asterisk-small:4px;--spectrum-field-label-text-to-asterisk-medium:4px;--spectrum-field-label-text-to-asterisk-large:5px;--spectrum-field-label-text-to-asterisk-extra-large:5px;--spectrum-field-label-top-to-asterisk-small:8px;--spectrum-field-label-top-to-asterisk-medium:12px;--spectrum-field-label-top-to-asterisk-large:15px;--spectrum-field-label-top-to-asterisk-extra-large:19px;--spectrum-field-label-top-margin-small:0px;--spectrum-field-label-top-margin-medium:4px;--spectrum-field-label-top-margin-large:5px;--spectrum-field-label-top-margin-extra-large:5px;--spectrum-field-label-to-component-quiet-small:-8px;--spectrum-field-label-to-component-quiet-medium:-8px;--spectrum-field-label-to-component-quiet-large:-12px;--spectrum-field-label-to-component-quiet-extra-large:-15px;--spectrum-help-text-top-to-workflow-icon-small:4px;--spectrum-help-text-top-to-workflow-icon-medium:3px;--spectrum-help-text-top-to-workflow-icon-large:6px;--spectrum-help-text-top-to-workflow-icon-extra-large:9px;--spectrum-status-light-dot-size-small:8px;--spectrum-status-light-dot-size-medium:8px;--spectrum-status-light-dot-size-large:10px;--spectrum-status-light-dot-size-extra-large:10px;--spectrum-status-light-top-to-dot-small:8px;--spectrum-status-light-top-to-dot-medium:12px;--spectrum-status-light-top-to-dot-large:15px;--spectrum-status-light-top-to-dot-extra-large:19px;--spectrum-action-button-edge-to-hold-icon-extra-small:3px;--spectrum-action-button-edge-to-hold-icon-small:3px;--spectrum-action-button-edge-to-hold-icon-medium:4px;--spectrum-action-button-edge-to-hold-icon-large:5px;--spectrum-action-button-edge-to-hold-icon-extra-large:6px;--spectrum-tooltip-tip-width:8px;--spectrum-tooltip-tip-height:4px;--spectrum-tooltip-maximum-width:160px;--spectrum-progress-circle-size-small:16px;--spectrum-progress-circle-size-medium:32px;--spectrum-progress-circle-size-large:64px;--spectrum-progress-circle-thickness-small:2px;--spectrum-progress-circle-thickness-medium:3px;--spectrum-progress-circle-thickness-large:4px;--spectrum-toast-height:48px;--spectrum-toast-maximum-width:336px;--spectrum-toast-top-to-workflow-icon:15px;--spectrum-toast-top-to-text:14px;--spectrum-toast-bottom-to-text:17px;--spectrum-action-bar-height:48px;--spectrum-action-bar-top-to-item-counter:14px;--spectrum-swatch-size-extra-small:16px;--spectrum-swatch-size-small:24px;--spectrum-swatch-size-medium:32px;--spectrum-swatch-size-large:40px;--spectrum-progress-bar-thickness-small:4px;--spectrum-progress-bar-thickness-medium:6px;--spectrum-progress-bar-thickness-large:8px;--spectrum-progress-bar-thickness-extra-large:10px;--spectrum-meter-default-width:192px;--spectrum-meter-thickness-small:4px;--spectrum-meter-thickness-large:6px;--spectrum-tag-top-to-avatar-small:4px;--spectrum-tag-top-to-avatar-medium:6px;--spectrum-tag-top-to-avatar-large:9px;--spectrum-tag-top-to-cross-icon-small:8px;--spectrum-tag-top-to-cross-icon-medium:12px;--spectrum-tag-top-to-cross-icon-large:15px;--spectrum-popover-top-to-content-area:4px;--spectrum-menu-item-edge-to-content-not-selected-small:28px;--spectrum-menu-item-edge-to-content-not-selected-medium:32px;--spectrum-menu-item-edge-to-content-not-selected-large:38px;--spectrum-menu-item-edge-to-content-not-selected-extra-large:45px;--spectrum-menu-item-top-to-disclosure-icon-small:7px;--spectrum-menu-item-top-to-disclosure-icon-medium:11px;--spectrum-menu-item-top-to-disclosure-icon-large:14px;--spectrum-menu-item-top-to-disclosure-icon-extra-large:17px;--spectrum-picker-visual-to-disclosure-icon-small:7px;--spectrum-picker-visual-to-disclosure-icon-medium:8px;--spectrum-picker-visual-to-disclosure-icon-large:9px;--spectrum-picker-visual-to-disclosure-icon-extra-large:10px;--spectrum-text-area-minimum-width:112px;--spectrum-text-area-minimum-height:56px;--spectrum-combo-box-visual-to-field-button-small:7px;--spectrum-combo-box-visual-to-field-button-medium:8px;--spectrum-combo-box-visual-to-field-button-large:9px;--spectrum-combo-box-visual-to-field-button-extra-large:10px;--spectrum-thumbnail-size-50:16px;--spectrum-thumbnail-size-75:18px;--spectrum-thumbnail-size-100:20px;--spectrum-thumbnail-size-200:22px;--spectrum-thumbnail-size-300:26px;--spectrum-thumbnail-size-400:28px;--spectrum-thumbnail-size-500:32px;--spectrum-thumbnail-size-600:36px;--spectrum-thumbnail-size-700:40px;--spectrum-thumbnail-size-800:44px;--spectrum-thumbnail-size-900:50px;--spectrum-thumbnail-size-1000:56px;--spectrum-alert-dialog-title-size:var(--spectrum-heading-size-s);--spectrum-alert-dialog-description-size:var(--spectrum-body-size-s);--spectrum-opacity-checkerboard-square-size:8px;--spectrum-breadcrumbs-height-multiline:72px;--spectrum-breadcrumbs-top-to-text:13px;--spectrum-breadcrumbs-top-to-text-compact:11px;--spectrum-breadcrumbs-top-to-text-multiline:12px;--spectrum-breadcrumbs-bottom-to-text:15px;--spectrum-breadcrumbs-bottom-to-text-compact:12px;--spectrum-breadcrumbs-bottom-to-text-multiline:9px;--spectrum-breadcrumbs-start-edge-to-text:8px;--spectrum-breadcrumbs-top-text-to-bottom-text:9px;--spectrum-breadcrumbs-top-to-separator-icon:19px;--spectrum-breadcrumbs-top-to-separator-icon-compact:15px;--spectrum-breadcrumbs-top-to-separator-icon-multiline:15px;--spectrum-breadcrumbs-separator-icon-to-bottom-text-multiline:11px;--spectrum-breadcrumbs-top-to-truncated-menu:8px;--spectrum-breadcrumbs-top-to-truncated-menu-compact:4px;--spectrum-avatar-size-50:16px;--spectrum-avatar-size-75:18px;--spectrum-avatar-size-100:20px;--spectrum-avatar-size-200:22px;--spectrum-avatar-size-300:26px;--spectrum-avatar-size-400:28px;--spectrum-avatar-size-500:32px;--spectrum-avatar-size-600:36px;--spectrum-avatar-size-700:40px;--spectrum-alert-banner-minimum-height:48px;--spectrum-alert-banner-width:832px;--spectrum-alert-banner-to-top-workflow-icon:15px;--spectrum-alert-banner-to-top-text:14px;--spectrum-alert-banner-to-bottom-text:17px;--spectrum-rating-indicator-width:18px;--spectrum-rating-indicator-to-icon:4px;--spectrum-color-area-width:192px;--spectrum-color-area-minimum-width:64px;--spectrum-color-area-height:192px;--spectrum-color-area-minimum-height:64px;--spectrum-color-wheel-width:192px;--spectrum-color-wheel-minimum-width:175px;--spectrum-color-slider-length:192px;--spectrum-illustrated-message-title-size:var(--spectrum-heading-size-m);--spectrum-illustrated-message-cjk-title-size:var(
--spectrum-heading-cjk-size-m
);--spectrum-illustrated-message-body-size:var(--spectrum-body-size-s);--spectrum-workflow-icon-size-50:14px;--spectrum-workflow-icon-size-75:16px;--spectrum-workflow-icon-size-100:18px;--spectrum-workflow-icon-size-200:20px;--spectrum-workflow-icon-size-300:22px;--spectrum-text-to-visual-50:6px;--spectrum-text-to-visual-75:7px;--spectrum-text-to-visual-100:8px;--spectrum-text-to-visual-200:9px;--spectrum-text-to-visual-300:10px;--spectrum-text-to-control-75:9px;--spectrum-text-to-control-100:10px;--spectrum-text-to-control-200:11px;--spectrum-text-to-control-300:13px;--spectrum-component-height-50:20px;--spectrum-component-height-75:24px;--spectrum-component-height-100:32px;--spectrum-component-height-200:40px;--spectrum-component-height-300:48px;--spectrum-component-pill-edge-to-visual-75:10px;--spectrum-component-pill-edge-to-visual-100:14px;--spectrum-component-pill-edge-to-visual-200:18px;--spectrum-component-pill-edge-to-visual-300:21px;--spectrum-component-pill-edge-to-visual-only-75:4px;--spectrum-component-pill-edge-to-visual-only-100:7px;--spectrum-component-pill-edge-to-visual-only-200:10px;--spectrum-component-pill-edge-to-visual-only-300:13px;--spectrum-component-pill-edge-to-text-75:12px;--spectrum-component-pill-edge-to-text-100:16px;--spectrum-component-pill-edge-to-text-200:20px;--spectrum-component-pill-edge-to-text-300:24px;--spectrum-component-edge-to-visual-50:6px;--spectrum-component-edge-to-visual-75:7px;--spectrum-component-edge-to-visual-100:10px;--spectrum-component-edge-to-visual-200:13px;--spectrum-component-edge-to-visual-300:15px;--spectrum-component-edge-to-visual-only-50:3px;--spectrum-component-edge-to-visual-only-75:4px;--spectrum-component-edge-to-visual-only-100:7px;--spectrum-component-edge-to-visual-only-200:10px;--spectrum-component-edge-to-visual-only-300:13px;--spectrum-component-edge-to-text-50:8px;--spectrum-component-edge-to-text-75:9px;--spectrum-component-edge-to-text-100:12px;--spectrum-component-edge-to-text-200:15px;--spectrum-component-edge-to-text-300:18px;--spectrum-component-top-to-workflow-icon-50:3px;--spectrum-component-top-to-workflow-icon-75:4px;--spectrum-component-top-to-workflow-icon-100:7px;--spectrum-component-top-to-workflow-icon-200:10px;--spectrum-component-top-to-workflow-icon-300:13px;--spectrum-component-top-to-text-50:3px;--spectrum-component-top-to-text-75:4px;--spectrum-component-top-to-text-100:6px;--spectrum-component-top-to-text-200:9px;--spectrum-component-top-to-text-300:12px;--spectrum-component-bottom-to-text-50:3px;--spectrum-component-bottom-to-text-75:5px;--spectrum-component-bottom-to-text-100:9px;--spectrum-component-bottom-to-text-200:11px;--spectrum-component-bottom-to-text-300:14px;--spectrum-component-to-menu-small:6px;--spectrum-component-to-menu-medium:6px;--spectrum-component-to-menu-large:7px;--spectrum-component-to-menu-extra-large:8px;--spectrum-field-edge-to-disclosure-icon-75:7px;--spectrum-field-edge-to-disclosure-icon-100:11px;--spectrum-field-edge-to-disclosure-icon-200:14px;--spectrum-field-edge-to-disclosure-icon-300:17px;--spectrum-field-top-to-alert-icon-small:4px;--spectrum-field-top-to-alert-icon-medium:7px;--spectrum-field-top-to-alert-icon-large:10px;--spectrum-field-top-to-alert-icon-extra-large:13px;--spectrum-field-top-to-validation-icon-small:7px;--spectrum-field-top-to-validation-icon-medium:11px;--spectrum-field-top-to-validation-icon-large:14px;--spectrum-field-top-to-validation-icon-extra-large:17px;--spectrum-field-top-to-progress-circle-small:4px;--spectrum-field-top-to-progress-circle-medium:8px;--spectrum-field-top-to-progress-circle-large:12px;--spectrum-field-top-to-progress-circle-extra-large:16px;--spectrum-field-edge-to-alert-icon-small:9px;--spectrum-field-edge-to-alert-icon-medium:12px;--spectrum-field-edge-to-alert-icon-large:15px;--spectrum-field-edge-to-alert-icon-extra-large:18px;--spectrum-field-edge-to-validation-icon-small:9px;--spectrum-field-edge-to-validation-icon-medium:12px;--spectrum-field-edge-to-validation-icon-large:15px;--spectrum-field-edge-to-validation-icon-extra-large:18px;--spectrum-field-text-to-alert-icon-small:8px;--spectrum-field-text-to-alert-icon-medium:12px;--spectrum-field-text-to-alert-icon-large:15px;--spectrum-field-text-to-alert-icon-extra-large:18px;--spectrum-field-text-to-validation-icon-small:8px;--spectrum-field-text-to-validation-icon-medium:12px;--spectrum-field-text-to-validation-icon-large:15px;--spectrum-field-text-to-validation-icon-extra-large:18px;--spectrum-field-width:192px;--spectrum-character-count-to-field-quiet-small:-3px;--spectrum-character-count-to-field-quiet-medium:-3px;--spectrum-character-count-to-field-quiet-large:-3px;--spectrum-character-count-to-field-quiet-extra-large:-4px;--spectrum-side-label-character-count-to-field:12px;--spectrum-side-label-character-count-top-margin-small:4px;--spectrum-side-label-character-count-top-margin-medium:8px;--spectrum-side-label-character-count-top-margin-large:11px;--spectrum-side-label-character-count-top-margin-extra-large:14px;--spectrum-disclosure-indicator-top-to-disclosure-icon-small:7px;--spectrum-disclosure-indicator-top-to-disclosure-icon-medium:11px;--spectrum-disclosure-indicator-top-to-disclosure-icon-large:14px;--spectrum-disclosure-indicator-top-to-disclosure-icon-extra-large:17px;--spectrum-navigational-indicator-top-to-back-icon-small:7px;--spectrum-navigational-indicator-top-to-back-icon-medium:11px;--spectrum-navigational-indicator-top-to-back-icon-large:14px;--spectrum-navigational-indicator-top-to-back-icon-extra-large:17px;--spectrum-color-control-track-width:24px;--spectrum-font-size-50:11px;--spectrum-font-size-75:12px;--spectrum-font-size-100:14px;--spectrum-font-size-200:16px;--spectrum-font-size-300:18px;--spectrum-font-size-400:20px;--spectrum-font-size-500:22px;--spectrum-font-size-600:25px;--spectrum-font-size-700:28px;--spectrum-font-size-800:32px;--spectrum-font-size-900:36px;--spectrum-font-size-1000:40px;--spectrum-font-size-1100:45px;--spectrum-font-size-1200:50px;--spectrum-font-size-1300:60px}:host,:root{--spectrum-edge-to-visual-only-75:4px;--spectrum-edge-to-visual-only-100:7px;--spectrum-edge-to-visual-only-200:10px;--spectrum-edge-to-visual-only-300:13px;--spectrum-slider-tick-mark-height:10px;--spectrum-slider-ramp-track-height:16px;--spectrum-colorwheel-path:"M 95 95 m -95 0 a 95 95 0 1 0 190 0 a 95 95 0 1 0 -190 0.2 M 95 95 m -73 0 a 73 73 0 1 0 146 0 a 73 73 0 1 0 -146 0";--spectrum-colorwheel-path-borders:"M 96 96 m -96 0 a 96 96 0 1 0 192 0 a 96 96 0 1 0 -192 0.2 M 96 96 m -72 0 a 72 72 0 1 0 144 0 a 72 72 0 1 0 -144 0";--spectrum-colorwheel-colorarea-container-size:144px;--spectrum-color-handle-size:16px;--spectrum-menu-item-selectable-edge-to-text-not-selected-small:28px;--spectrum-menu-item-selectable-edge-to-text-not-selected-medium:32px;--spectrum-menu-item-selectable-edge-to-text-not-selected-large:38px;--spectrum-menu-item-selectable-edge-to-text-not-selected-extra-large:45px;--spectrum-menu-item-checkmark-height-small:10px;--spectrum-menu-item-checkmark-height-medium:10px;--spectrum-menu-item-checkmark-height-large:12px;--spectrum-menu-item-checkmark-height-extra-large:14px;--spectrum-menu-item-checkmark-width-small:10px;--spectrum-menu-item-checkmark-width-medium:10px;--spectrum-menu-item-checkmark-width-large:12px;--spectrum-menu-item-checkmark-width-extra-large:14px}:host,:root{--spectrum-checkbox-control-size-small:12px;--spectrum-checkbox-control-size-medium:14px;--spectrum-checkbox-control-size-large:16px;--spectrum-checkbox-control-size-extra-large:18px;--spectrum-checkbox-top-to-control-small:6px;--spectrum-checkbox-top-to-control-medium:9px;--spectrum-checkbox-top-to-control-large:12px;--spectrum-checkbox-top-to-control-extra-large:15px;--spectrum-switch-control-width-small:23px;--spectrum-switch-control-width-medium:26px;--spectrum-switch-control-width-large:29px;--spectrum-switch-control-width-extra-large:33px;--spectrum-switch-control-height-small:12px;--spectrum-switch-control-height-medium:14px;--spectrum-switch-control-height-large:16px;--spectrum-switch-control-height-extra-large:18px;--spectrum-switch-top-to-control-small:6px;--spectrum-switch-top-to-control-medium:9px;--spectrum-switch-top-to-control-large:12px;--spectrum-switch-top-to-control-extra-large:15px;--spectrum-radio-button-control-size-small:12px;--spectrum-radio-button-control-size-medium:14px;--spectrum-radio-button-control-size-large:16px;--spectrum-radio-button-control-size-extra-large:18px;--spectrum-radio-button-top-to-control-small:6px;--spectrum-radio-button-top-to-control-medium:9px;--spectrum-radio-button-top-to-control-large:12px;--spectrum-radio-button-top-to-control-extra-large:15px;--spectrum-slider-control-height-small:14px;--spectrum-slider-control-height-medium:16px;--spectrum-slider-control-height-large:18px;--spectrum-slider-control-height-extra-large:20px;--spectrum-slider-handle-size-small:14px;--spectrum-slider-handle-size-medium:16px;--spectrum-slider-handle-size-large:18px;--spectrum-slider-handle-size-extra-large:20px;--spectrum-slider-handle-border-width-down-small:5px;--spectrum-slider-handle-border-width-down-medium:6px;--spectrum-slider-handle-border-width-down-large:7px;--spectrum-slider-handle-border-width-down-extra-large:8px;--spectrum-slider-bottom-to-handle-small:5px;--spectrum-slider-bottom-to-handle-medium:8px;--spectrum-slider-bottom-to-handle-large:11px;--spectrum-slider-bottom-to-handle-extra-large:14px;--spectrum-corner-radius-75:2px;--spectrum-corner-radius-100:4px;--spectrum-corner-radius-200:8px;--spectrum-drop-shadow-x:0px;--spectrum-drop-shadow-y:1px;--spectrum-drop-shadow-blur:4px}
`;function Jt(r,t,e){return typeof r===t?()=>r:typeof r=="function"?r:e}N.registerThemeFragment("medium","scale",to);class eo{constructor(t,{direction:e,elementEnterAction:o,elements:a,focusInIndex:s,isFocusableElement:c,listenerScope:i}={elements:()=>[]}){this._currentIndex=-1,this._direction=()=>"both",this.directionLength=5,this.elementEnterAction=n=>{},this._focused=!1,this._focusInIndex=n=>0,this.isFocusableElement=n=>!0,this._listenerScope=()=>this.host,this.offset=0,this.handleFocusin=n=>{if(!this.isEventWithinListenerScope(n))return;this.isRelatedTargetAnElement(n)&&this.hostContainsFocus();const m=n.composedPath();let g=-1;m.find(d=>(g=this.elements.indexOf(d),g!==-1)),this.currentIndex=g>-1?g:this.currentIndex},this.handleFocusout=n=>{this.isRelatedTargetAnElement(n)&&this.hostNoLongerContainsFocus()},this.handleKeydown=n=>{if(!this.acceptsEventCode(n.code)||n.defaultPrevented)return;let m=0;switch(n.code){case"ArrowRight":m+=1;break;case"ArrowDown":m+=this.direction==="grid"?this.directionLength:1;break;case"ArrowLeft":m-=1;break;case"ArrowUp":m-=this.direction==="grid"?this.directionLength:1;break;case"End":this.currentIndex=0,m-=1;break;case"Home":this.currentIndex=this.elements.length-1,m+=1}n.preventDefault(),this.direction==="grid"&&this.currentIndex+m<0?this.currentIndex=0:this.direction==="grid"&&this.currentIndex+m>this.elements.length-1?this.currentIndex=this.elements.length-1:this.setCurrentIndexCircularly(m),this.elementEnterAction(this.elements[this.currentIndex]),this.focus()},this.host=t,this.host.addController(this),this._elements=a,this.isFocusableElement=c||this.isFocusableElement,this._direction=Jt(e,"string",this._direction),this.elementEnterAction=o||this.elementEnterAction,this._focusInIndex=Jt(s,"number",this._focusInIndex),this._listenerScope=Jt(i,"object",this._listenerScope)}get currentIndex(){return this._currentIndex===-1&&(this._currentIndex=this.focusInIndex),this._currentIndex-this.offset}set currentIndex(t){this._currentIndex=t+this.offset}get direction(){return this._direction()}get elements(){return this.cachedElements||(this.cachedElements=this._elements()),this.cachedElements}set focused(t){t!==this.focused&&(this._focused=t)}get focused(){return this._focused}get focusInElement(){return this.elements[this.focusInIndex]}get focusInIndex(){return this._focusInIndex(this.elements)}isEventWithinListenerScope(t){return this._listenerScope()===this.host||t.composedPath().includes(this._listenerScope())}update({elements:t}={elements:()=>[]}){this.unmanage(),this._elements=t,this.clearElementCache(),this.manage()}focus(t){let e=this.elements[this.currentIndex];(!e||!this.isFocusableElement(e))&&(this.setCurrentIndexCircularly(1),e=this.elements[this.currentIndex]),e&&this.isFocusableElement(e)&&e.focus(t)}clearElementCache(t=0){delete this.cachedElements,this.offset=t}setCurrentIndexCircularly(t){const{length:e}=this.elements;let o=e,a=(e+this.currentIndex+t)%e;for(;o&&this.elements[a]&&!this.isFocusableElement(this.elements[a]);)a=(e+a+t)%e,o-=1;this.currentIndex=a}hostContainsFocus(){this.host.addEventListener("focusout",this.handleFocusout),this.host.addEventListener("keydown",this.handleKeydown),this.focused=!0}hostNoLongerContainsFocus(){this.host.addEventListener("focusin",this.handleFocusin),this.host.removeEventListener("focusout",this.handleFocusout),this.host.removeEventListener("keydown",this.handleKeydown),this.currentIndex=this.focusInIndex,this.focused=!1}isRelatedTargetAnElement(t){const e=t.relatedTarget;return!this.elements.includes(e)}acceptsEventCode(t){if(t==="End"||t==="Home")return!0;switch(this.direction){case"horizontal":return t==="ArrowLeft"||t==="ArrowRight";case"vertical":return t==="ArrowUp"||t==="ArrowDown";case"both":case"grid":return t.startsWith("Arrow")}}manage(){this.addEventListeners()}unmanage(){this.removeEventListeners()}addEventListeners(){this.host.addEventListener("focusin",this.handleFocusin)}removeEventListeners(){this.host.removeEventListener("focusin",this.handleFocusin),this.host.removeEventListener("focusout",this.handleFocusout),this.host.removeEventListener("keydown",this.handleKeydown)}hostConnected(){this.addEventListeners()}hostDisconnected(){this.removeEventListeners()}}class ro extends eo{constructor(){super(...arguments),this.managed=!0,this.manageIndexesAnimationFrame=0}set focused(t){t!==this.focused&&(super.focused=t,this.manageTabindexes())}get focused(){return super.focused}clearElementCache(t=0){cancelAnimationFrame(this.manageIndexesAnimationFrame),super.clearElementCache(t),this.managed&&(this.manageIndexesAnimationFrame=requestAnimationFrame(()=>this.manageTabindexes()))}manageTabindexes(){this.focused?this.updateTabindexes(()=>({tabIndex:-1})):this.updateTabindexes(t=>({removeTabIndex:t.contains(this.focusInElement)&&t!==this.focusInElement,tabIndex:t===this.focusInElement?0:-1}))}updateTabindexes(t){this.elements.forEach(e=>{const{tabIndex:o,removeTabIndex:a}=t(e);if(!a)return void(e.tabIndex=o);e.removeAttribute("tabindex");const s=e;s.requestUpdate&&s.requestUpdate()})}manage(){this.managed=!0,this.manageTabindexes(),super.manage()}unmanage(){this.managed=!1,this.updateTabindexes(()=>({tabIndex:0})),super.unmanage()}hostUpdated(){this.host.hasUpdated||this.manageTabindexes()}}var oo=p`
:host{--spectrum-sidenav-item-padding-y:var(--spectrum-global-dimension-size-65)}:host{list-style-type:none;margin:0;padding:0}:host([multilevel]){margin:0;padding:0}:host{--spectrum-web-component-sidenav-font-weight:var(
--spectrum-sidenav-item-font-weight,var(--spectrum-global-font-weight-regular)
);display:block;width:240px}:host([variant=multilevel]){--spectrum-web-component-sidenav-font-weight:var(
--spectrum-sidenav-multilevel-main-item-font-weight,var(--spectrum-global-font-weight-bold)
)}
`;const Fe=r=>r.querySelector('button:not([tabindex="-1"]), [href]:not([tabindex="-1"]), input:not([tabindex="-1"]), select:not([tabindex="-1"]), textarea:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]), [focusable]:not([tabindex="-1"])');let te=!0;try{document.body.querySelector(":focus-visible")}catch(r){te=!1,import("./focus-visible.js")}const so=r=>{var t;const e=Symbol("endPolyfillCoordination");return t=e,class extends r{constructor(){super(...arguments),this[t]=null}connectedCallback(){super.connectedCallback&&super.connectedCallback(),te||requestAnimationFrame(()=>{this[e]==null&&(this[e]=(o=>{if(o.shadowRoot==null||o.hasAttribute("data-js-focus-visible"))return()=>{};if(!self.applyFocusVisiblePolyfill){const a=()=>{self.applyFocusVisiblePolyfill&&o.shadowRoot&&self.applyFocusVisiblePolyfill(o.shadowRoot),o.manageAutoFocus&&o.manageAutoFocus()};return self.addEventListener("focus-visible-polyfill-ready",a,{once:!0}),()=>{self.removeEventListener("focus-visible-polyfill-ready",a)}}return self.applyFocusVisiblePolyfill(o.shadowRoot),o.manageAutoFocus&&o.manageAutoFocus(),()=>{}})(this))})}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback(),te||requestAnimationFrame(()=>{this[e]!=null&&(this[e](),this[e]=null)})}}};var ao=Object.defineProperty,co=Object.getOwnPropertyDescriptor,ee=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?co(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&ao(t,e,s),s};function Ge(){return new Promise(r=>requestAnimationFrame(()=>r()))}class F extends so(L){constructor(){super(...arguments),this.disabled=!1,this.autofocus=!1,this._tabIndex=0,this.manipulatingTabindex=!1,this._recentlyConnected=!1}get tabIndex(){if(this.focusElement===this){const e=this.hasAttribute("tabindex")?Number(this.getAttribute("tabindex")):NaN;return isNaN(e)?-1:e}const t=parseFloat(this.hasAttribute("tabindex")&&this.getAttribute("tabindex")||"0");return this.disabled||t<0?-1:this.focusElement?this.focusElement.tabIndex:t}set tabIndex(t){if(this.manipulatingTabindex)this.manipulatingTabindex=!1;else if(this.focusElement!==this){if(t===-1?this.addEventListener("pointerdown",this.onPointerdownManagementOfTabIndex):(this.manipulatingTabindex=!0,this.removeEventListener("pointerdown",this.onPointerdownManagementOfTabIndex)),t===-1||this.disabled)return this.setAttribute("tabindex","-1"),this.removeAttribute("focusable"),void(t!==-1&&this.manageFocusElementTabindex(t));this.setAttribute("focusable",""),this.hasAttribute("tabindex")?this.removeAttribute("tabindex"):this.manipulatingTabindex=!1,this.manageFocusElementTabindex(t)}else if(t!==this.tabIndex){this._tabIndex=t;const e=this.disabled?"-1":""+t;this.setAttribute("tabindex",e)}}onPointerdownManagementOfTabIndex(){this.tabIndex===-1&&(this.tabIndex=0,this.focus({preventScroll:!0}))}async manageFocusElementTabindex(t){this.focusElement||await this.updateComplete,t===null?this.focusElement.removeAttribute("tabindex"):this.focusElement.tabIndex=t}get focusElement(){throw new Error("Must implement focusElement getter!")}focus(t){this.disabled||!this.focusElement||(this.focusElement!==this?this.focusElement.focus(t):HTMLElement.prototype.focus.apply(this,[t]))}blur(){const t=this.focusElement||this;t!==this?t.blur():HTMLElement.prototype.blur.apply(this)}click(){if(this.disabled)return;const t=this.focusElement||this;t!==this?t.click():HTMLElement.prototype.click.apply(this)}manageAutoFocus(){this.autofocus&&(this.dispatchEvent(new KeyboardEvent("keydown",{code:"Tab"})),this.focusElement.focus())}firstUpdated(t){super.firstUpdated(t),(!this.hasAttribute("tabindex")||this.getAttribute("tabindex")!=="-1")&&this.setAttribute("focusable","")}update(t){t.has("disabled")&&this.handleDisabledChanged(this.disabled,t.get("disabled")),super.update(t)}updated(t){super.updated(t),t.has("disabled")&&this.disabled&&this.blur()}async handleDisabledChanged(t,e){const o=()=>this.focusElement!==this&&this.focusElement.disabled!==void 0;t?(this.manipulatingTabindex=!0,this.setAttribute("tabindex","-1"),await this.updateComplete,o()?this.focusElement.disabled=!0:this.setAttribute("aria-disabled","true")):e&&(this.manipulatingTabindex=!0,this.focusElement===this?this.setAttribute("tabindex",""+this._tabIndex):this.removeAttribute("tabindex"),await this.updateComplete,o()?this.focusElement.disabled=!1:this.removeAttribute("aria-disabled"))}async getUpdateComplete(){const t=await super.getUpdateComplete();return this._recentlyConnected&&(this._recentlyConnected=!1,await Ge(),await Ge()),t}connectedCallback(){super.connectedCallback(),this._recentlyConnected=!0,this.updateComplete.then(()=>{this.manageAutoFocus()})}}ee([l({type:Boolean,reflect:!0})],F.prototype,"disabled",2),ee([l({type:Boolean})],F.prototype,"autofocus",2),ee([l({type:Number})],F.prototype,"tabIndex",1);const b=r=>r!=null?r:f,Ve=1,io=2,Ke=3,Ze=4,We=r=>(...t)=>({_$litDirective$:r,values:t});class Qe{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,o){this._$Ct=t,this._$AM=e,this._$Ci=o}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const Ye=r=>r.strings===void 0,no={},ft=(r,t)=>{var e,o;const a=r._$AN;if(a===void 0)return!1;for(const s of a)(o=(e=s)._$AO)===null||o===void 0||o.call(e,t,!1),ft(s,t);return!0},$t=r=>{let t,e;do{if((t=r._$AM)===void 0)break;e=t._$AN,e.delete(r),r=t}while((e==null?void 0:e.size)===0)},Je=r=>{for(let t;t=r._$AM;r=t){let e=t._$AN;if(e===void 0)t._$AN=e=new Set;else if(e.has(r))break;e.add(r),mo(t)}};function lo(r){this._$AN!==void 0?($t(this),this._$AM=r,Je(this)):this._$AM=r}function uo(r,t=!1,e=0){const o=this._$AH,a=this._$AN;if(a!==void 0&&a.size!==0)if(t)if(Array.isArray(o))for(let s=e;s<o.length;s++)ft(o[s],!1),$t(o[s]);else o!=null&&(ft(o,!1),$t(o));else ft(this,r)}const mo=r=>{var t,e,o,a;r.type==io&&((t=(o=r)._$AP)!==null&&t!==void 0||(o._$AP=uo),(e=(a=r)._$AQ)!==null&&e!==void 0||(a._$AQ=lo))};class po extends Qe{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,o){super._$AT(t,e,o),Je(this),this.isConnected=t._$AU}_$AO(t,e=!0){var o,a;t!==this.isConnected&&(this.isConnected=t,t?(o=this.reconnected)===null||o===void 0||o.call(this):(a=this.disconnected)===null||a===void 0||a.call(this)),e&&(ft(this,t),$t(this))}setValue(t){if(Ye(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}const go=We(class extends Qe{constructor(r){if(super(r),r.type!==Ke&&r.type!==Ve&&r.type!==Ze)throw Error("The `live` directive is not allowed on child or event bindings");if(!Ye(r))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(r,[t]){if(t===H||t===f)return t;const e=r.element,o=r.name;if(r.type===Ke){if(t===e[o])return H}else if(r.type===Ze){if(!!t===e.hasAttribute(o))return H}else if(r.type===Ve&&e.getAttribute(o)===t+"")return H;return((a,s=no)=>{a._$AH=s})(r),t}});var bo=Object.defineProperty,ho=Object.getOwnPropertyDescriptor,yt=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?ho(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&bo(t,e,s),s};function re(r){class t extends r{renderAnchor({id:o,className:a,ariaHidden:s,labelledby:c,tabindex:i,anchorContent:n=u`<slot></slot>`}){return u`<a
                    id=${o}
                    class=${b(a)}
                    href=${b(this.href)}
                    download=${b(this.download)}
                    target=${b(this.target)}
                    aria-label=${b(this.label)}
                    aria-labelledby=${b(c)}
                    aria-hidden=${b(s?"true":void 0)}
                    tabindex=${b(i)}
                    rel=${b(this.rel)}
                >${n}</a>`}}return yt([l({reflect:!0})],t.prototype,"download",2),yt([l()],t.prototype,"label",2),yt([l({reflect:!0})],t.prototype,"href",2),yt([l({reflect:!0})],t.prototype,"target",2),yt([l({reflect:!0})],t.prototype,"rel",2),t}class tr{constructor(t,{target:e,config:o,callback:a,skipInitial:s}){this.t=new Set,this.o=!1,this.i=!1,this.h=t,e!==null&&this.t.add(e!=null?e:t),this.l=o,this.o=s!=null?s:this.o,this.callback=a,window.MutationObserver?(this.u=new MutationObserver(c=>{this.handleChanges(c),this.h.requestUpdate()}),t.addController(this)):console.warn("MutationController error: browser does not support MutationObserver.")}handleChanges(t){var e;this.value=(e=this.callback)===null||e===void 0?void 0:e.call(this,t,this.u)}hostConnected(){for(const t of this.t)this.observe(t)}hostDisconnected(){this.disconnect()}async hostUpdated(){const t=this.u.takeRecords();(t.length||!this.o&&this.i)&&this.handleChanges(t),this.i=!1}observe(t){this.t.add(t),this.u.observe(t,this.l),this.i=!0,this.h.requestUpdate()}disconnect(){this.u.disconnect()}}var vo=Object.defineProperty,fo=Object.getOwnPropertyDescriptor,er=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?fo(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&vo(t,e,s),s};const oe=Symbol("assignedNodes");function se(r){return typeof window<"u"&&window.navigator!=null&&r.test(window.navigator.platform)}function yo(){return se(/^iPad/)||se(/^Mac/)&&navigator.maxTouchPoints>1}function xo(){return se(/^iPhone/)||yo()}function ko(){return function(r){return typeof window<"u"&&window.navigator!=null&&r.test(window.navigator.userAgent)}(/Android/)}const rr=(r,t,{position:e,prepareCallback:o}={position:"beforeend"})=>{let{length:a}=r;if(a===0)return()=>r;let s=1,c=0;(e==="afterbegin"||e==="afterend")&&(s=-1,c=a-1);const i=new Array(a),n=new Array(a),m=document.createComment("placeholder for reparented element");do{const g=r[c];o&&(n[c]=o(g)),i[c]=m.cloneNode();const d=g.parentElement||g.getRootNode();d&&d!==g&&d.replaceChild(i[c],g),t.insertAdjacentElement(e,g),c+=s}while(--a>0);return function(){return function(g,d,y=[]){for(let x=0;x<d.length;++x){const O=d[x],A=g[x],rt=A.parentElement||A.getRootNode();y[x]&&y[x](O),rt&&rt!==A&&rt.replaceChild(O,A),delete g[x]}return d}(i,r,n)}};var or=p`
#list{--spectrum-sidenav-item-padding-y:var(--spectrum-global-dimension-size-65);list-style-type:none;margin:0;padding:0}:host{list-style-type:none;margin-bottom:var(
--spectrum-sidenav-item-gap,var(--spectrum-global-dimension-size-50)
);margin-left:0;margin-right:0;margin-top:var(
--spectrum-sidenav-item-gap,var(--spectrum-global-dimension-size-50)
)}#item-link{-ms-flex-pack:left;align-items:center;border-radius:var(
--spectrum-sidenav-item-border-radius,var(--spectrum-alias-border-radius-regular)
);box-sizing:border-box;cursor:pointer;display:inline-flex;font-size:var(
--spectrum-sidenav-item-text-size,var(--spectrum-alias-font-size-default)
);font-style:normal;font-weight:var(
--spectrum-sidenav-item-text-font-weight,var(--spectrum-global-font-weight-regular)
);-webkit-hyphens:auto;hyphens:auto;justify-content:left;min-height:var(
--spectrum-sidenav-item-height,var(--spectrum-alias-single-line-height)
);padding:var(--spectrum-sidenav-item-padding-y) var(
--spectrum-sidenav-item-padding-x,var(--spectrum-global-dimension-size-150)
);position:relative;text-decoration:none;transition:background-color var(--spectrum-global-animation-duration-100,.13s) ease-out,color var(--spectrum-global-animation-duration-100,.13s) ease-out;width:100%;word-break:break-word}#item-link:focus{outline:none}#item-link:before{border:var(
--spectrum-alias-focus-ring-size,var(--spectrum-global-dimension-static-size-25)
) solid transparent;border-radius:var(
--spectrum-sidenav-item-border-radius,var(--spectrum-alias-border-radius-regular)
);content:"";inset:0;pointer-events:none;position:absolute;transition:border var(--spectrum-global-animation-duration-100,.13s) ease-out}:host([dir=ltr]) #item-link ::slotted([slot=icon]){margin-right:var(
--spectrum-sidenav-icon-gap,var(--spectrum-global-dimension-size-100)
)}:host([dir=rtl]) #item-link ::slotted([slot=icon]){margin-left:var(
--spectrum-sidenav-icon-gap,var(--spectrum-global-dimension-size-100)
)}#item-link ::slotted([slot=icon]){flex-shrink:0}:host([dir=ltr]) .spectrum-SideNav-heading{margin-right:0}:host([dir=ltr]) .spectrum-SideNav-heading,:host([dir=rtl]) .spectrum-SideNav-heading{margin-left:0}:host([dir=rtl]) .spectrum-SideNav-heading{margin-right:0}:host([selected])>#item-link{background-color:var(
--spectrum-sidenav-item-background-color-selected,var(--spectrum-alias-highlight-hover)
);color:var(
--spectrum-sidenav-item-text-color-selected,var(--spectrum-alias-text-color-hover)
)}.is-active>#item-link{background-color:var(
--spectrum-sidenav-item-background-color-down,var(--spectrum-alias-highlight-hover)
)}:host([disabled]) #item-link{background-color:var(
--spectrum-sidenav-item-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);color:var(
--spectrum-sidenav-item-text-color-disabled,var(--spectrum-alias-text-color-disabled)
);cursor:default;pointer-events:none}#item-link{background-color:var(
--spectrum-sidenav-item-background-color,var(--spectrum-alias-background-color-transparent)
);color:var(
--spectrum-sidenav-item-text-color,var(--spectrum-alias-text-color)
)}#item-link:hover{background-color:var(
--spectrum-sidenav-item-background-color-hover,var(--spectrum-alias-highlight-hover)
);color:var(
--spectrum-sidenav-item-text-color-hover,var(--spectrum-alias-text-color-hover)
)}#item-link:active{background-color:var(
--spectrum-sidenav-item-background-color-down,var(--spectrum-alias-highlight-hover)
)}#item-link.focus-visible{background-color:var(
--spectrum-sidenav-item-background-color-key-focus,var(--spectrum-alias-highlight-hover)
);color:var(
--spectrum-sidenav-item-text-color-key-focus,var(--spectrum-alias-text-color-hover)
)}#item-link:focus-visible{background-color:var(
--spectrum-sidenav-item-background-color-key-focus,var(--spectrum-alias-highlight-hover)
);color:var(
--spectrum-sidenav-item-text-color-key-focus,var(--spectrum-alias-text-color-hover)
)}#item-link.focus-visible:before{border-color:var(
--spectrum-sidenav-item-border-color-key-focus,var(--spectrum-alias-border-color-key-focus)
)}#item-link.focus-visible:before{border-color:var(
--spectrum-sidenav-item-border-color-key-focus,var(--spectrum-alias-border-color-key-focus)
)}#item-link:focus-visible:before{border-color:var(
--spectrum-sidenav-item-border-color-key-focus,var(--spectrum-alias-border-color-key-focus)
)}@media (forced-colors:active){:host{--spectrum-sidenav-item-text-color-selected:HighlightText;--spectrum-sidenav-item-background-color-selected:Highlight;--spectrum-sidenav-item-background-color-disabled:ButtonFace;--spectrum-sidenav-item-text-color-disabled:GrayText;--spectrum-sidenav-item-background-color:ButtonFace;--spectrum-sidenav-item-text-color:ButtonText;--spectrum-sidenav-item-background-color-hover:ButtonFace;--spectrum-sidenav-item-text-color-hover:ButtonText;--spectrum-sidenav-item-background-color-down:ButtonFace;--spectrum-sidenav-item-background-color-key-focus:ButtonFace;--spectrum-sidenav-item-text-color-key-focus:ButtonText;--spectrum-sidenav-item-border-color-key-focus:ButtonText;forced-color-adjust:none}}:host{display:block}:host([disabled]){pointer-events:none}:host([multiLevel]){--spectrum-web-component-sidenav-font-weight:var(
--spectrum-sidenav-item-font-weight,700
)}::slotted(sp-sidenav-item:not([multiLevel])){--spectrum-web-component-sidenav-font-weight:var(
--spectrum-sidenav-item-font-weight,400
)}#item-link{font-weight:var(--spectrum-web-component-sidenav-font-weight);justify-content:start}:host([dir=ltr]) #item-link[data-level="1"]{padding-left:calc(var(
--spectrum-sidenav-multilevel-item-indentation-level1,
var(--spectrum-global-dimension-size-150)
) + var(
--spectrum-sidenav-item-padding-x,
var(--spectrum-global-dimension-size-150)
))}:host([dir=ltr]) #item-link[data-level="2"]{padding-left:calc(var(
--spectrum-sidenav-multilevel-item-indentation-level2,
var(--spectrum-global-dimension-size-300)
) + var(
--spectrum-sidenav-item-padding-x,
var(--spectrum-global-dimension-size-150)
))}:host([dir=rtl]) #item-link[data-level="1"]{padding-right:calc(var(
--spectrum-sidenav-multilevel-item-indentation-level1,
var(--spectrum-global-dimension-size-150)
) + var(
--spectrum-sidenav-item-padding-x,
var(--spectrum-global-dimension-size-150)
))}:host([dir=rtl]) #item-link[data-level="2"]{padding-right:calc(var(
--spectrum-sidenav-multilevel-item-indentation-level2,
var(--spectrum-global-dimension-size-300)
) + var(
--spectrum-sidenav-item-padding-x,
var(--spectrum-global-dimension-size-150)
))}a ::slotted(sp-sidenav-item){display:none}
`,wo=Object.defineProperty,zo=Object.getOwnPropertyDescriptor,ae=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?zo(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&wo(t,e,s),s};const ce=class extends re(F){constructor(){super(...arguments),this.value=void 0,this.selected=!1,this.expanded=!1}static get styles(){return[or]}get parentSideNav(){return this._parentSidenav||(this._parentSidenav=this.closest("sp-sidenav")),this._parentSidenav}get hasChildren(){return!!this.querySelector("sp-sidenav-item")}get depth(){let r=0,t=this.parentElement;for(;t instanceof ce;)r++,t=t.parentElement;return r}handleSideNavSelect(r){this.selected=r.target===this}handleClick(r){!this.href&&r&&r.preventDefault(),!this.disabled&&(!this.href||r!=null&&r.defaultPrevented)&&(this.hasChildren?this.expanded=!this.expanded:this.value&&this.announceSelected(this.value))}announceSelected(r){const t=new CustomEvent("sidenav-select",{bubbles:!0,composed:!0,detail:{value:r}});this.dispatchEvent(t)}click(){this.handleClick()}get focusElement(){return this.shadowRoot.querySelector("#item-link")}update(r){this.hasAttribute("slot")||(this.slot="descendant"),super.update(r)}render(){return u`
            <a
                href=${this.href||"#"}
                target=${b(this.target)}
                download=${b(this.download)}
                rel=${b(this.rel)}
                data-level="${this.depth}"
                @click="${this.handleClick}"
                id="item-link"
                aria-current=${b(this.selected&&this.href?"page":void 0)}
            >
                <slot name="icon"></slot>
                ${this.label}
                <slot></slot>
            </a>
            ${this.expanded?u`
                      <slot name="descendant"></slot>
                  `:u``}
        `}updated(r){this.hasChildren&&this.expanded&&!this.selected&&(this.focusElement.tabIndex=-1),super.updated(r)}connectedCallback(){super.connectedCallback(),this.startTrackingSelection()}disconnectedCallback(){this.stopTrackingSelection(),super.disconnectedCallback()}async startTrackingSelection(){const r=this.parentSideNav;if(r&&(await r.updateComplete,r.startTrackingSelectionForItem(this),this.selected=this.value!=null&&this.value===r.value,this.selected===!0&&r.variant==="multilevel")){let t=this.parentElement;for(;t instanceof ce;)t.expanded=!0,t=t.parentElement}}stopTrackingSelection(){const r=this.parentSideNav;r&&r.stopTrackingSelectionForItem(this),this._parentSidenav=void 0}};let xt=ce;ae([l()],xt.prototype,"value",2),ae([l({type:Boolean,reflect:!0})],xt.prototype,"selected",2),ae([l({type:Boolean,reflect:!0})],xt.prototype,"expanded",2);var Co=p`
#list{--spectrum-sidenav-item-padding-y:var(--spectrum-global-dimension-size-65);list-style-type:none;margin:0;padding:0}:host([dir=ltr]) #heading{margin-right:0}:host([dir=ltr]) #heading,:host([dir=rtl]) #heading{margin-left:0}:host([dir=rtl]) #heading{margin-right:0}#heading{border-radius:var(
--spectrum-sidenav-heading-border-radius,var(--spectrum-alias-border-radius-regular)
);color:var(
--spectrum-sidenav-heading-text-color,var(--spectrum-global-color-gray-700)
);font-size:var(
--spectrum-sidenav-heading-text-size,var(--spectrum-global-dimension-font-size-50)
);font-style:normal;font-weight:var(
--spectrum-sidenav-heading-text-font-weight,var(--spectrum-global-font-weight-medium)
);height:var(
--spectrum-sidenav-heading-height,var(--spectrum-alias-single-line-height)
);letter-spacing:var(
--spectrum-sidenav-heading-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-sidenav-heading-height,var(--spectrum-alias-single-line-height)
);margin-bottom:var(
--spectrum-sidenav-heading-gap-bottom,var(--spectrum-global-dimension-size-50)
);margin-top:var(
--spectrum-sidenav-heading-gap-top,var(--spectrum-global-dimension-size-200)
);padding-bottom:0;padding-left:var(
--spectrum-sidenav-heading-padding-x,var(--spectrum-global-dimension-size-150)
);padding-right:var(
--spectrum-sidenav-heading-padding-x,var(--spectrum-global-dimension-size-150)
);padding-top:0;text-transform:uppercase}:host{display:block}
`,Io=Object.defineProperty,Eo=Object.getOwnPropertyDescriptor;class sr extends L{constructor(){super(...arguments),this.label=""}static get styles(){return[or,Co]}update(t){this.hasAttribute("slot")||(this.slot="descendant"),super.update(t)}render(){return u`
            <h2 id="heading">${this.label}</h2>
            <div id="list" aria-labelledby="heading">
                <slot name="descendant"></slot>
            </div>
        `}}((r,t,e,o)=>{for(var a,s=o>1?void 0:o?Eo(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);o&&s&&Io(t,e,s)})([l({reflect:!0})],sr.prototype,"label",2);var Lo=Object.defineProperty,Ao=Object.getOwnPropertyDescriptor,ie=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?Ao(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&Lo(t,e,s),s};class _t extends F{constructor(){super(...arguments),this.items=new Set,this.rovingTabindexController=new ro(this,{focusInIndex:t=>t.findIndex(e=>this.value?!e.disabled&&!this.isDisabledChild(e)&&e.value===this.value:!e.disabled&&!this.isDisabledChild(e)),direction:"vertical",elements:()=>[...this.querySelectorAll("sp-sidenav-item")],isFocusableElement:t=>!t.disabled&&!this.isDisabledChild(t)}),this.manageTabIndex=!1,this.value=void 0,this.variant=void 0}static get styles(){return[oo]}startTrackingSelectionForItem(t){this.items.add(t),this.rovingTabindexController.clearElementCache()}stopTrackingSelectionForItem(t){this.items.delete(t),this.rovingTabindexController.clearElementCache()}handleSelect(t){if(t.stopPropagation(),this.value===t.detail.value)return;const e=this.value;this.value=t.detail.value,this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0,cancelable:!0}))?this.items.forEach(o=>o.handleSideNavSelect(t)):(this.value=e,t.target.selected=!1,t.preventDefault())}focus(){this.rovingTabindexController.focus()}blur(){this.focusElement!==this&&super.blur()}click(){this.focusElement!==this&&super.click()}get focusElement(){return this.rovingTabindexController.focusInElement||this}isDisabledChild(t){if(t.disabled)return!0;let e=t.parentElement;for(;e instanceof sr||!e.disabled&&e instanceof xt&&e.expanded;)e=e.parentElement;return e!==this}handleSlotchange(){this.manageTabIndex?this.rovingTabindexController.manage():this.rovingTabindexController.unmanage()}render(){return u`
            <nav @sidenav-select=${this.handleSelect}>
                <slot
                    name="descendant"
                    @slotchange=${this.handleSlotchange}
                ></slot>
            </nav>
        `}willUpdate(){if(!this.hasUpdated){const t=this.querySelector("[selected]");t&&(this.value=t.value)}}updated(t){super.updated(t),t.has("manageTabIndex")&&(this.manageTabIndex?this.rovingTabindexController.manage():this.rovingTabindexController.unmanage())}}ie([l({type:Boolean,reflect:!0,attribute:"manage-tab-index"})],_t.prototype,"manageTabIndex",2),ie([l({reflect:!0})],_t.prototype,"value",2),ie([l({reflect:!0})],_t.prototype,"variant",2),customElements.define("sp-sidenav",_t);class M{constructor(){this.iconsetMap=new Map}static getInstance(){return M.instance||(M.instance=new M),M.instance}addIconset(t,e){this.iconsetMap.set(t,e);const o=new CustomEvent("sp-iconset-added",{bubbles:!0,composed:!0,detail:{name:t,iconset:e}});setTimeout(()=>window.dispatchEvent(o),0)}removeIconset(t){this.iconsetMap.delete(t);const e=new CustomEvent("sp-iconset-removed",{bubbles:!0,composed:!0,detail:{name:t}});setTimeout(()=>window.dispatchEvent(e),0)}getIconset(t){return this.iconsetMap.get(t)}}var So=Object.defineProperty,To=Object.getOwnPropertyDescriptor;class ar extends ${constructor(){super(...arguments),this.registered=!1,this.handleRemoved=({detail:t})=>{t.name===this.name&&(this.registered=!1,this.addIconset())}}firstUpdated(){this.style.display="none"}set name(t){this.registered&&(this._name&&M.getInstance().removeIconset(this._name),t&&M.getInstance().addIconset(t,this)),this._name=t}get name(){return this._name}connectedCallback(){super.connectedCallback(),this.addIconset(),window.addEventListener("sp-iconset-removed",this.handleRemoved)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sp-iconset-removed",this.handleRemoved),this.removeIconset()}addIconset(){!this.name||this.registered||(M.getInstance().addIconset(this.name,this),this.registered=!0)}removeIconset(){this.name&&(M.getInstance().removeIconset(this.name),this.registered=!1)}}((r,t,e,o)=>{for(var a,s=o>1?void 0:o?To(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);o&&s&&So(t,e,s)})([l()],ar.prototype,"name",1);var $o=Object.defineProperty,_o=Object.getOwnPropertyDescriptor;class cr extends ar{constructor(){super(...arguments),this.iconMap=new Map}updated(t){if(!this.slotContainer)return;const e=this.getSVGNodes(this.slotContainer);this.updateSVG(e),super.updated(t)}async applyIconToElement(t,e,o,a){await this.updateComplete;const s=this.iconMap.get(e);if(!s)throw new Error(`Unable to find icon ${e}`);const c=this.prepareSvgClone(s);c.setAttribute("role","img"),a?c.setAttribute("aria-label",a):c.setAttribute("aria-hidden","true"),t.shadowRoot?t.shadowRoot.appendChild(c):t.appendChild(c)}getIconList(){return[...this.iconMap.keys()]}prepareSvgClone(t){const e=t.cloneNode(!0),o=document.createElementNS("http://www.w3.org/2000/svg","svg"),a=e.getAttribute("viewBox")||"";for(o.style.cssText="pointer-events: none; display: block; width: 100%; height: 100%;",o.setAttribute("viewBox",a),o.setAttribute("preserveAspectRatio","xMidYMid meet"),o.setAttribute("focusable","false");e.childNodes.length>0;)o.appendChild(e.childNodes[0]);return o}getSVGIconName(t){return t}getSanitizedIconName(t){return t}renderDefaultContent(){return u``}render(){return u`
            <slot @slotchange=${this.onSlotChange}>
                ${this.renderDefaultContent()}
            </slot>
        `}updateSVG(t){t.reduce((e,o)=>{const a=o.querySelectorAll("symbol");return e.push(...a),e},[]).forEach(e=>{this.iconMap.set(this.getSanitizedIconName(e.id),e)})}getSVGNodes(t){return t.assignedNodes({flatten:!0}).filter(e=>e.nodeName==="svg")}onSlotChange(t){const e=t.target,o=this.getSVGNodes(e);this.updateSVG(o)}}((r,t,e,o)=>{for(var a,s=o>1?void 0:o?_o(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);o&&s&&$o(t,e,s)})([X("slot")],cr.prototype,"slotContainer",2);var Ho=qr`<svg xmlns="http://www.w3.org/2000/svg"><symbol id="spectrum-icon-Arrow100" viewBox="0 0 10 10"><path d="M9.7 4.387L6.623 1.262a.875.875 0 10-1.247 1.226l1.61 1.637H.925a.875.875 0 000 1.75h6.062l-1.61 1.637a.875.875 0 101.247 1.226l3.075-3.125a.874.874 0 000-1.226z"/></symbol><symbol id="spectrum-icon-Arrow200" viewBox="0 0 12 12"><path d="M11.284 5.356L7.718 1.788a.911.911 0 10-1.29 1.29l2.012 2.01H1.286a.911.911 0 100 1.823H8.44L6.429 8.923a.911.911 0 001.289 1.289l3.566-3.567a.912.912 0 000-1.29z"/></symbol><symbol id="spectrum-icon-Arrow300" viewBox="0 0 14 14"><path d="M12.893 6.33L8.826 2.261a.95.95 0 10-1.344 1.341L9.93 6.051H1.621a.95.95 0 100 1.898H9.93l-2.447 2.447a.95.95 0 001.344 1.342l4.067-4.067a.95.95 0 000-1.342z"/></symbol><symbol id="spectrum-icon-Arrow400" viewBox="0 0 16 16"><path d="M14.572 7.3l-4.63-4.63a.989.989 0 00-1.399 1.398l2.942 2.943H1.87a.99.99 0 000 1.978h9.615l-2.942 2.943a.989.989 0 101.398 1.398l4.631-4.63a.988.988 0 000-1.4z"/></symbol><symbol id="spectrum-icon-Arrow500" viewBox="0 0 18 18"><path d="M16.336 8.271l-5.269-5.267A1.03 1.03 0 109.61 4.46l3.51 3.509H2.021a1.03 1.03 0 000 2.06H13.12l-3.51 3.51a1.03 1.03 0 101.457 1.456l5.269-5.268a1.03 1.03 0 000-1.456z"/></symbol><symbol id="spectrum-icon-Arrow600" viewBox="0 0 20 20"><path d="M18.191 9.241l-5.986-5.987a1.073 1.073 0 00-1.518 1.517l4.155 4.156H2.063a1.073 1.073 0 100 2.146h12.779l-4.154 4.155a1.073 1.073 0 101.517 1.518l5.986-5.987a1.073 1.073 0 000-1.518z"/></symbol><symbol id="spectrum-icon-Arrow75" viewBox="0 0 10 10"><path d="M9.26 4.406L6.528 1.672A.84.84 0 005.34 2.859l1.3 1.301H1.396a.84.84 0 000 1.68H6.64l-1.301 1.3a.84.84 0 001.188 1.188l2.734-2.734a.84.84 0 000-1.188z"/></symbol><symbol id="spectrum-icon-Asterisk100" viewBox="0 0 8 8"><path d="M6.575 6.555c.055.056.092.13 0 .2l-1.149.741c-.092.056-.129.019-.166-.074L3.834 4.94 1.963 7c-.019.036-.074.073-.129 0l-.889-.927c-.093-.055-.074-.111 0-.166l2.111-1.76L.648 3.24c-.037 0-.092-.074-.056-.167l.63-1.259a.097.097 0 01.167-.036L3.5 3.148l.13-2.7a.1.1 0 01.081-.111.15.15 0 01.03 0l1.537.2c.093 0 .111.037.093.13l-.723 2.647 2.445-.741c.055-.037.111-.037.148.074l.241 1.37c.018.093 0 .13-.074.13l-2.556.2z"/></symbol><symbol id="spectrum-icon-Asterisk200" viewBox="0 0 10 10"><path d="M7.861 7.953c.062.063.1.146 0 .23l-1.293.834c-.1.063-.145.021-.187-.083l-1.6-2.793-2.105 2.314c-.021.04-.083.082-.145 0l-1-1.043c-.1-.062-.083-.125 0-.187l2.375-1.981-2.715-1.026c-.042 0-.1-.083-.063-.188l.707-1.412a.111.111 0 01.136-.074.116.116 0 01.052.034l2.378 1.54.146-3.043A.11.11 0 014.638.95a.161.161 0 01.034 0l1.73.23c.1 0 .125.042.1.146l-.814 2.979 2.751-.834c.062-.042.125-.042.167.083l.271 1.542c.02.1 0 .146-.083.146l-2.876.23z"/></symbol><symbol id="spectrum-icon-Asterisk300" viewBox="0 0 10 10"><path d="M8.266 8.324c.07.071.116.164 0 .258l-1.454.938c-.116.071-.163.024-.21-.094l-1.8-3.141-2.367 2.6c-.024.045-.094.092-.163 0l-1.13-1.167c-.118-.07-.094-.141 0-.21l2.671-2.227L.766 4.13c-.047 0-.116-.094-.071-.211l.8-1.593a.124.124 0 01.153-.084.13.13 0 01.058.038l2.669 1.738.164-3.422a.124.124 0 01.1-.14.186.186 0 01.038 0l1.945.258c.118 0 .14.047.118.164l-.915 3.349 3.094-.938c.07-.047.14-.047.187.094l.3 1.734c.023.118 0 .164-.094.164l-3.234.258z"/></symbol><symbol id="spectrum-icon-Asterisk75" viewBox="0 0 8 8"><path d="M6.26 6.463c.049.05.082.116 0 .181l-1.022.659c-.082.05-.115.017-.148-.066L3.822 5.03 2.16 6.859c-.017.032-.066.065-.115 0l-.79-.824c-.083-.049-.066-.1 0-.148l1.877-1.565L.99 3.516c-.033 0-.082-.066-.05-.148l.56-1.119a.087.087 0 01.108-.059.09.09 0 01.04.027l1.878 1.218.116-2.4a.087.087 0 01.072-.1h.027l1.367.181c.083 0 .1.033.083.116L4.55 3.581l2.174-.659c.049-.033.1-.033.132.066l.214 1.218c.016.083 0 .115-.066.115l-2.273.181z"/></symbol><symbol id="spectrum-icon-Checkmark100" viewBox="0 0 10 10"><path d="M3.5 9.5a.999.999 0 01-.774-.368l-2.45-3a1 1 0 111.548-1.264l1.657 2.028 4.68-6.01A1 1 0 019.74 2.114l-5.45 7a1 1 0 01-.777.386z"/></symbol><symbol id="spectrum-icon-Checkmark200" viewBox="0 0 12 12"><path d="M4.313 10.98a1.042 1.042 0 01-.8-.375L.647 7.165a1.042 1.042 0 011.6-1.333l2.042 2.45 5.443-6.928a1.042 1.042 0 011.64 1.287l-6.24 7.94a1.04 1.04 0 01-.804.399z"/></symbol><symbol id="spectrum-icon-Checkmark300" viewBox="0 0 14 14"><path d="M5.102 12.514a1.087 1.087 0 01-.834-.39L.988 8.19A1.085 1.085 0 012.656 6.8l2.421 2.906 6.243-7.947a1.085 1.085 0 011.707 1.34L5.955 12.1a1.089 1.089 0 01-.838.415z"/></symbol><symbol id="spectrum-icon-Checkmark400" viewBox="0 0 16 16"><path d="M5.864 14.114a1.13 1.13 0 01-.868-.407L1.25 9.21a1.13 1.13 0 111.736-1.448l2.854 3.425 7.148-9.1a1.13 1.13 0 111.778 1.397L6.753 13.682a1.13 1.13 0 01-.872.432z"/></symbol><symbol id="spectrum-icon-Checkmark50" viewBox="0 0 10 10"><path d="M3.815 8.687a.921.921 0 01-.708-.332l-1.891-2.27a.921.921 0 011.416-1.18L3.794 6.3l3.56-4.531a.921.921 0 111.45 1.138L4.54 8.335a.921.921 0 01-.712.351z"/></symbol><symbol id="spectrum-icon-Checkmark500" viewBox="0 0 16 16"><path d="M5.597 14.784a1.177 1.177 0 01-.905-.424L.417 9.229a1.177 1.177 0 111.809-1.508l3.343 4.013 8.174-10.402a1.177 1.177 0 011.852 1.456L6.523 14.334a1.178 1.178 0 01-.91.45z"/></symbol><symbol id="spectrum-icon-Checkmark600" viewBox="0 0 18 18"><path d="M6.297 16.534a1.228 1.228 0 01-.942-.442L.48 10.244a1.227 1.227 0 011.885-1.57l3.904 4.684L15.6 1.482a1.227 1.227 0 011.93 1.516L7.262 16.065a1.229 1.229 0 01-.947.469z"/></symbol><symbol id="spectrum-icon-Checkmark75" viewBox="0 0 10 10"><path d="M3.667 9.07a.96.96 0 01-.737-.344L.753 6.114a.96.96 0 111.474-1.23l1.418 1.701 4.112-5.233a.96.96 0 011.51 1.186L4.422 8.704a.962.962 0 01-.741.367z"/></symbol><symbol id="spectrum-icon-Chevron100" viewBox="0 0 10 10"><path d="M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z"/></symbol><symbol id="spectrum-icon-Chevron200" viewBox="0 0 12 12"><path d="M9.034 5.356L4.343.663a.911.911 0 00-1.29 1.289L7.102 6l-4.047 4.047a.911.911 0 101.289 1.29l4.691-4.692a.912.912 0 000-1.29z"/></symbol><symbol id="spectrum-icon-Chevron300" viewBox="0 0 14 14"><path d="M10.639 7a.947.947 0 00-.278-.671l-.003-.002-5.33-5.33a.95.95 0 00-1.342 1.342L8.346 7l-4.661 4.66a.95.95 0 101.342 1.343l5.33-5.33.003-.001A.947.947 0 0010.64 7z"/></symbol><symbol id="spectrum-icon-Chevron400" viewBox="0 0 16 16"><path d="M4.97 15.044a.989.989 0 01-.698-1.688L9.627 8 4.27 2.644a.989.989 0 011.4-1.398L11.726 7.3a.988.988 0 010 1.398L5.67 14.754a.985.985 0 01-.7.29z"/></symbol><symbol id="spectrum-icon-Chevron500" viewBox="0 0 16 16"><path d="M12.133 7.271L5.263.401a1.03 1.03 0 00-1.457 1.457L9.947 8l-6.141 6.142a1.03 1.03 0 001.457 1.457l6.87-6.87a1.03 1.03 0 000-1.457z"/></symbol><symbol id="spectrum-icon-Chevron600" viewBox="0 0 18 18"><path d="M5.04 17.863a1.073 1.073 0 01-.759-1.832L11.313 9 4.28 1.969A1.073 1.073 0 015.8.45l7.79 7.79a1.073 1.073 0 010 1.518l-7.79 7.79a1.07 1.07 0 01-.759.314z"/></symbol><symbol id="spectrum-icon-Chevron75" viewBox="0 0 10 10"><path d="M7.482 4.406l-.001-.001L3.86.783a.84.84 0 00-1.188 1.188L5.702 5l-3.03 3.03A.84.84 0 003.86 9.216l3.621-3.622h.001a.84.84 0 000-1.19z"/></symbol><symbol id="spectrum-icon-CornerTriangle100" viewBox="0 0 5 5"><path d="M4.763 0a.248.248 0 00-.177.073l-4.5 4.5A.25.25 0 00.263 5h4.5a.25.25 0 00.25-.25V.25a.25.25 0 00-.25-.25z"/></symbol><symbol id="spectrum-icon-CornerTriangle200" viewBox="0 0 6 6"><path d="M5.719.37a.281.281 0 00-.2.082L.452 5.519a.281.281 0 00.2.481h5.067A.281.281 0 006 5.719V.652A.281.281 0 005.72.37z"/></symbol><symbol id="spectrum-icon-CornerTriangle300" viewBox="0 0 7 7"><path d="M6.683.67a.315.315 0 00-.223.093l-5.7 5.7a.316.316 0 00.224.54h5.7A.316.316 0 007 6.687V.986A.316.316 0 006.684.67z"/></symbol><symbol id="spectrum-icon-CornerTriangle75" viewBox="0 0 5 5"><path d="M4.78.558a.222.222 0 00-.157.065l-4 4a.222.222 0 00.157.379h4a.222.222 0 00.222-.222v-4A.222.222 0 004.78.558z"/></symbol><symbol id="spectrum-icon-Cross100" viewBox="0 0 8 8"><path d="M5.238 4l2.456-2.457A.875.875 0 106.456.306L4 2.763 1.543.306A.875.875 0 00.306 1.544L2.763 4 .306 6.457a.875.875 0 101.238 1.237L4 5.237l2.456 2.457a.875.875 0 101.238-1.237z"/></symbol><symbol id="spectrum-icon-Cross200" viewBox="0 0 10 10"><path d="M6.29 5l2.922-2.922a.911.911 0 00-1.29-1.29L5 3.712 2.078.789a.911.911 0 00-1.29 1.289L3.712 5 .79 7.922a.911.911 0 101.289 1.29L5 6.288 7.923 9.21a.911.911 0 001.289-1.289z"/></symbol><symbol id="spectrum-icon-Cross300" viewBox="0 0 12 12"><path d="M7.344 6l3.395-3.396a.95.95 0 00-1.344-1.342L6 4.657 2.604 1.262a.95.95 0 00-1.342 1.342L4.657 6 1.262 9.396a.95.95 0 001.343 1.343L6 7.344l3.395 3.395a.95.95 0 001.344-1.344z"/></symbol><symbol id="spectrum-icon-Cross400" viewBox="0 0 12 12"><path d="M7.398 6l3.932-3.932A.989.989 0 009.932.67L6 4.602 2.068.67A.989.989 0 00.67 2.068L4.602 6 .67 9.932a.989.989 0 101.398 1.398L6 7.398l3.932 3.932a.989.989 0 001.398-1.398z"/></symbol><symbol id="spectrum-icon-Cross500" viewBox="0 0 14 14"><path d="M8.457 7l4.54-4.54a1.03 1.03 0 00-1.458-1.456L7 5.543l-4.54-4.54a1.03 1.03 0 00-1.457 1.458L5.543 7l-4.54 4.54a1.03 1.03 0 101.457 1.456L7 8.457l4.54 4.54a1.03 1.03 0 001.456-1.458z"/></symbol><symbol id="spectrum-icon-Cross600" viewBox="0 0 16 16"><path d="M9.518 8l5.23-5.228a1.073 1.073 0 00-1.518-1.518L8.001 6.483l-5.229-5.23a1.073 1.073 0 00-1.518 1.519L6.483 8l-5.23 5.229a1.073 1.073 0 101.518 1.518l5.23-5.23 5.228 5.23a1.073 1.073 0 001.518-1.518z"/></symbol><symbol id="spectrum-icon-Cross75" viewBox="0 0 8 8"><path d="M5.188 4l2.14-2.14A.84.84 0 106.141.672L4 2.812 1.86.672A.84.84 0 00.672 1.86L2.812 4 .672 6.14A.84.84 0 101.86 7.328L4 5.188l2.14 2.14A.84.84 0 107.328 6.14z"/></symbol><symbol id="spectrum-icon-Dash100" viewBox="0 0 10 10"><path d="M8.5 6h-7a1 1 0 010-2h7a1 1 0 010 2z"/></symbol><symbol id="spectrum-icon-Dash200" viewBox="0 0 12 12"><path d="M10.021 7.042H1.98a1.042 1.042 0 110-2.083h8.043a1.042 1.042 0 010 2.083z"/></symbol><symbol id="spectrum-icon-Dash300" viewBox="0 0 12 12"><path d="M10.61 7.085H1.39a1.085 1.085 0 010-2.17h9.22a1.085 1.085 0 010 2.17z"/></symbol><symbol id="spectrum-icon-Dash400" viewBox="0 0 14 14"><path d="M12.277 8.13H1.723a1.13 1.13 0 110-2.26h10.554a1.13 1.13 0 110 2.26z"/></symbol><symbol id="spectrum-icon-Dash50" viewBox="0 0 8 8"><path d="M6.634 4.921H1.366a.921.921 0 010-1.842h5.268a.921.921 0 110 1.842z"/></symbol><symbol id="spectrum-icon-Dash500" viewBox="0 0 16 16"><path d="M14.03 9.178H1.969a1.178 1.178 0 110-2.356H14.03a1.178 1.178 0 010 2.356z"/></symbol><symbol id="spectrum-icon-Dash600" viewBox="0 0 18 18"><path d="M15.882 10.227H2.117a1.227 1.227 0 010-2.454h13.765a1.227 1.227 0 010 2.454z"/></symbol><symbol id="spectrum-icon-Dash75" viewBox="0 0 8 8"><path d="M6.99 4.96H1.01a.96.96 0 010-1.92h5.98a.96.96 0 010 1.92z"/></symbol><symbol id="spectrum-icon-DoubleGripper" viewBox="0 0 16 4"><path d="M15.45 1.05H.55a.5.5 0 010-1h14.9a.5.5 0 010 1zm.5 2.4a.5.5 0 00-.5-.5H.55a.5.5 0 000 1h14.9a.5.5 0 00.5-.5z"/></symbol><symbol id="spectrum-icon-SingleGripper" viewBox="0 0 24 2"><path d="M23 2H1a1 1 0 010-2h22a1 1 0 010 2z"/></symbol><symbol id="spectrum-icon-TripleGripper" viewBox="0 0 10 8"><path d="M9.45 1.05H.55a.5.5 0 010-1h8.9a.5.5 0 010 1zm.5 2.45a.5.5 0 00-.5-.5H.55a.5.5 0 000 1h8.9a.5.5 0 00.5-.5zm0 3a.5.5 0 00-.5-.5H.55a.5.5 0 000 1h8.9a.5.5 0 00.5-.5z"/></symbol></svg>`;customElements.define("sp-icons-medium",class extends cr{constructor(){super(),this.name="ui"}renderDefaultContent(){return Ho}getSVGIconName(r){return`spectrum-icon-${r}`}getSanitizedIconName(r){return r.replace("spectrum-icon-","")}});var jo=p`
:host{display:inline-flex;vertical-align:top}:host([dir]){-webkit-appearance:none}:host([disabled]){cursor:auto;pointer-events:none}#button{inset:0;position:absolute}:host:after{pointer-events:none}slot[name=icon]::slotted(img),slot[name=icon]::slotted(svg){fill:currentcolor;stroke:currentcolor;height:var(
--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225)
);width:var(
--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225)
)}[icon-only]+#label{display:none}:host([size=s]){--spectrum-icon-tshirt-size-height:var(
--spectrum-alias-workflow-icon-size-s
);--spectrum-icon-tshirt-size-width:var(
--spectrum-alias-workflow-icon-size-s
);--spectrum-ui-icon-tshirt-size-height:var(
--spectrum-alias-ui-icon-cornertriangle-size-75
);--spectrum-ui-icon-tshirt-size-width:var(
--spectrum-alias-ui-icon-cornertriangle-size-75
)}:host([size=m]){--spectrum-icon-tshirt-size-height:var(
--spectrum-alias-workflow-icon-size-m
);--spectrum-icon-tshirt-size-width:var(
--spectrum-alias-workflow-icon-size-m
);--spectrum-ui-icon-tshirt-size-height:var(
--spectrum-alias-ui-icon-cornertriangle-size-100
);--spectrum-ui-icon-tshirt-size-width:var(
--spectrum-alias-ui-icon-cornertriangle-size-100
)}:host([size=l]){--spectrum-icon-tshirt-size-height:var(
--spectrum-alias-workflow-icon-size-l
);--spectrum-icon-tshirt-size-width:var(
--spectrum-alias-workflow-icon-size-l
);--spectrum-ui-icon-tshirt-size-height:var(
--spectrum-alias-ui-icon-cornertriangle-size-200
);--spectrum-ui-icon-tshirt-size-width:var(
--spectrum-alias-ui-icon-cornertriangle-size-200
)}:host([size=xl]){--spectrum-icon-tshirt-size-height:var(
--spectrum-alias-workflow-icon-size-xl
);--spectrum-icon-tshirt-size-width:var(
--spectrum-alias-workflow-icon-size-xl
);--spectrum-ui-icon-tshirt-size-height:var(
--spectrum-alias-ui-icon-cornertriangle-size-300
);--spectrum-ui-icon-tshirt-size-width:var(
--spectrum-alias-ui-icon-cornertriangle-size-300
)}
`,qo=Object.defineProperty,Mo=Object.getOwnPropertyDescriptor,ne=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?Mo(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&qo(t,e,s),s};class lt extends function(t,e){var o;class a extends t{constructor(...c){super(c),this.slotHasContent=!1,new tr(this,{config:{characterData:!0,subtree:!0},callback:i=>{for(const n of i)if(n.type==="characterData")return void this.manageTextObservedSlot()}})}manageTextObservedSlot(){if(!this[oe])return;const c=[...this[oe]].filter(i=>!!i.tagName||!!i.textContent&&i.textContent.trim());this.slotHasContent=c.length>0}update(c){if(!this.hasUpdated){const{childNodes:i}=this,n=[...i].filter(m=>m.tagName?e?m.getAttribute("slot")===e:!m.hasAttribute("slot"):!!m.textContent&&m.textContent.trim());this.slotHasContent=n.length>0}super.update(c)}firstUpdated(c){super.firstUpdated(c),this.updateComplete.then(()=>{this.manageTextObservedSlot()})}}return o=oe,er([l({type:Boolean,attribute:!1})],a.prototype,"slotHasContent",2),er([Ne(e,!0)],a.prototype,o,2),a}(re(F)){constructor(){super(),this.active=!1,this.type="button",this.proxyFocus=this.proxyFocus.bind(this),this.addEventListener("click",this.handleClickCapture,{capture:!0})}static get styles(){return[jo]}get focusElement(){return this}get hasLabel(){return this.slotHasContent}get buttonContent(){return[u`
                <slot name="icon" ?icon-only=${!this.hasLabel}></slot>
            `,u`
                <span id="label">
                    <slot @slotchange=${this.manageTextObservedSlot}></slot>
                </span>
            `]}click(){this.disabled||this.shouldProxyClick()||super.click()}handleClickCapture(t){if(this.disabled)return t.preventDefault(),t.stopImmediatePropagation(),t.stopPropagation(),!1}proxyFocus(){this.focus()}shouldProxyClick(){let t=!1;if(this.anchorElement)this.anchorElement.click(),t=!0;else if(this.type!=="button"){const e=document.createElement("button");e.type=this.type,this.insertAdjacentElement("afterend",e),e.click(),e.remove(),t=!0}return t}renderAnchor(){return u`
            ${this.buttonContent}
            ${super.renderAnchor({id:"button",ariaHidden:!0,className:"button anchor hidden"})}
        `}renderButton(){return u`
            ${this.buttonContent}
        `}render(){return this.href&&this.href.length>0?this.renderAnchor():this.renderButton()}handleKeydown(t){const{code:e}=t;e==="Space"&&(t.preventDefault(),this.href===void 0&&(this.addEventListener("keyup",this.handleKeyup),this.active=!0))}handleKeypress(t){const{code:e}=t;switch(e){case"Enter":case"NumpadEnter":this.click()}}handleKeyup(t){const{code:e}=t;e==="Space"&&(this.removeEventListener("keyup",this.handleKeyup),this.active=!1,this.click())}handleRemoveActive(){this.active=!1}handlePointerdown(){this.active=!0}manageAnchor(){this.href&&this.href.length>0?(this.getAttribute("role")==="button"&&this.setAttribute("role","link"),this.removeEventListener("click",this.shouldProxyClick)):((!this.hasAttribute("role")||this.getAttribute("role")==="link")&&this.setAttribute("role","button"),this.addEventListener("click",this.shouldProxyClick))}firstUpdated(t){super.firstUpdated(t),this.hasAttribute("tabindex")||(this.tabIndex=0),this.manageAnchor(),this.addEventListener("keydown",this.handleKeydown),this.addEventListener("keypress",this.handleKeypress),this.addEventListener("pointerdown",this.handlePointerdown)}updated(t){super.updated(t),t.has("href")&&this.manageAnchor(),t.has("label")&&this.setAttribute("aria-label",this.label||""),t.has("active")&&(this.active?(this.addEventListener("focusout",this.handleRemoveActive),this.addEventListener("pointerup",this.handleRemoveActive),this.addEventListener("pointercancel",this.handleRemoveActive),this.addEventListener("pointerleave",this.handleRemoveActive)):(this.removeEventListener("focusout",this.handleRemoveActive),this.removeEventListener("pointerup",this.handleRemoveActive),this.removeEventListener("pointercancel",this.handleRemoveActive),this.removeEventListener("pointerleave",this.handleRemoveActive))),this.anchorElement&&(this.anchorElement.addEventListener("focus",this.proxyFocus),this.anchorElement.tabIndex=-1)}}ne([l({type:Boolean,reflect:!0})],lt.prototype,"active",2),ne([l({type:String})],lt.prototype,"type",2),ne([X(".anchor")],lt.prototype,"anchorElement",2);var Bo=p`
:host{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;align-items:center;-webkit-appearance:button;box-sizing:border-box;cursor:pointer;display:inline-flex;font-family:var(
--mod-sans-font-family-stack,var(--spectrum-sans-font-family-stack)
);justify-content:center;line-height:var(--mod-line-height-100,var(--spectrum-line-height-100));margin:0;overflow:visible;text-decoration:none;text-transform:none;transition:background var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,border-color var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,color var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,box-shadow var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out;-webkit-user-select:none;user-select:none;vertical-align:top}:host(:focus){outline:none}:host([disabled]){cursor:default}:host:after{display:block;margin:calc(var(--mod-focus-indicator-gap, var(--spectrum-focus-indicator-gap))*-1);transition:opacity var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,margin var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out}:host(.focus-visible):after{margin:calc(var(--mod-focus-indicator-gap, var(--spectrum-focus-indicator-gap))*-2)}:host(.focus-visible):after{margin:calc(var(--mod-focus-indicator-gap, var(--spectrum-focus-indicator-gap))*-2)}:host(:focus-visible):after{margin:calc(var(--mod-focus-indicator-gap, var(--spectrum-focus-indicator-gap))*-2)}#label{place-self:center;text-align:center}#label[hidden]{display:none}:host{--spectrum-button-animation-duration:var(
--spectrum-animation-duration-100
);--spectrum-button-border-radius:var(--spectrum-corner-radius-100);--spectrum-button-border-width:var(--spectrum-border-width-200);--spectrum-button-focus-ring-gap:var(--spectrum-focus-indicator-gap);--spectrum-button-focus-ring-thickness:var(
--spectrum-focus-indicator-thickness
);--spectrum-button-focus-indicator-color:var(
--spectrum-focus-indicator-color
);--spectrum-button-focus-ring-border-radius:calc(var(--spectrum-button-border-radius) + var(--spectrum-button-focus-ring-gap))}:host([size=s]){--spectrum-button-min-width:calc(var(--spectrum-component-height-75)*var(--spectrum-button-minimum-width-multiplier));--spectrum-button-border-radius:var(
--spectrum-component-pill-edge-to-text-75
);--spectrum-button-height:var(--spectrum-component-height-75);--spectrum-button-font-size:var(--spectrum-font-size-75);--spectrum-button-edge-to-visual:calc(var(--spectrum-component-pill-edge-to-visual-75) - var(--spectrum-button-border-width));--spectrum-button-edge-to-text:calc(var(--spectrum-component-pill-edge-to-text-75) - var(--spectrum-button-border-width));--spectrum-button-padding-label-to-icon:var(--spectrum-text-to-visual-75);--spectrum-button-padding-label-top:var(
--spectrum-component-top-to-text-75
);--spectrum-button-padding-label-bottom:var(
--spectrum-component-bottom-to-text-75
)}:host([size=m]){--spectrum-button-min-width:calc(var(--spectrum-component-height-100)*var(--spectrum-button-minimum-width-multiplier));--spectrum-button-border-radius:var(
--spectrum-component-pill-edge-to-text-100
);--spectrum-button-height:var(--spectrum-component-height-100);--spectrum-button-font-size:var(--spectrum-font-size-100);--spectrum-button-edge-to-visual:calc(var(--spectrum-component-pill-edge-to-visual-100) - var(--spectrum-button-border-width));--spectrum-button-edge-to-text:calc(var(--spectrum-component-pill-edge-to-text-100) - var(--spectrum-button-border-width));--spectrum-button-padding-label-to-icon:var(--spectrum-text-to-visual-100);--spectrum-button-padding-label-top:var(
--spectrum-component-top-to-text-100
);--spectrum-button-padding-label-bottom:var(
--spectrum-component-bottom-to-text-100
)}:host([size=l]){--spectrum-button-min-width:calc(var(--spectrum-component-height-200)*var(--spectrum-button-minimum-width-multiplier));--spectrum-button-border-radius:var(
--spectrum-component-pill-edge-to-text-200
);--spectrum-button-height:var(--spectrum-component-height-200);--spectrum-button-font-size:var(--spectrum-font-size-200);--spectrum-button-edge-to-visual:calc(var(--spectrum-component-pill-edge-to-visual-200) - var(--spectrum-button-border-width));--spectrum-button-edge-to-text:calc(var(--spectrum-component-pill-edge-to-text-200) - var(--spectrum-button-border-width));--spectrum-button-padding-label-to-icon:var(--spectrum-text-to-visual-200);--spectrum-button-padding-label-top:var(
--spectrum-component-top-to-text-200
);--spectrum-button-padding-label-bottom:var(
--spectrum-component-bottom-to-text-200
)}:host([size=xl]){--spectrum-button-min-width:calc(var(--spectrum-component-height-300)*var(--spectrum-button-minimum-width-multiplier));--spectrum-button-border-radius:var(
--spectrum-component-pill-edge-to-text-300
);--spectrum-button-height:var(--spectrum-component-height-300);--spectrum-button-font-size:var(--spectrum-font-size-300);--spectrum-button-edge-to-visual:calc(var(--spectrum-component-pill-edge-to-visual-300) - var(--spectrum-button-border-width));--spectrum-button-edge-to-text:calc(var(--spectrum-component-pill-edge-to-text-300) - var(--spectrum-button-border-width));--spectrum-button-padding-label-to-icon:var(--spectrum-text-to-visual-300);--spectrum-button-padding-label-top:var(
--spectrum-component-top-to-text-300
);--spectrum-button-padding-label-bottom:var(
--spectrum-component-bottom-to-text-300
)}:host{border-radius:var(
--mod-button-border-radius,var(--spectrum-button-border-radius)
);border-style:solid;border-width:var(
--mod-button-border-width,var(--spectrum-button-border-width)
);color:inherit;font-size:var(--mod-button-font-size,var(--spectrum-button-font-size));font-weight:var(--mod-bold-font-weight,var(--spectrum-bold-font-weight));gap:var(
--mod-button-padding-label-to-icon,var(--spectrum-button-padding-label-to-icon)
);height:var(--mod-button-height,var(--spectrum-button-height));min-block-size:var(--mod-button-height,var(--spectrum-button-height));min-inline-size:var(
--mod-button-min-width,var(--spectrum-button-min-width)
);padding-block:0;padding-inline:var(
--mod-button-edge-to-text,var(--spectrum-button-edge-to-text)
);position:relative}:host(:hover),:host([active]){box-shadow:none}::slotted([slot=icon]){color:inherit;margin-inline-start:calc(var(--mod-button-edge-to-visual, var(--spectrum-button-edge-to-visual)) - var(--mod-button-edge-to-text, var(--spectrum-button-edge-to-text)))}:host:after{border-radius:calc(var(--mod-button-border-radius, var(--spectrum-button-border-radius)) + var(--mod-focus-indicator-gap, var(--spectrum-focus-indicator-gap)))}#label{align-self:start;line-height:var(--spectrum-line-height-100);padding-block-end:calc(var(
--mod-button-padding-label-bottom,
var(--spectrum-button-padding-label-bottom)
) - var(--mod-button-border-width, var(--spectrum-button-border-width)));padding-block-start:calc(var(
--mod-button-padding-label-top,
var(--spectrum-button-padding-label-top)
) - var(--mod-button-border-width, var(--spectrum-button-border-width)));white-space:nowrap}:host(.focus-visible):after,:host([focused]):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) var(
--mod-button-focus-ring-color,var(--spectrum-button-focus-indicator-color)
)}:host(.focus-visible):after,:host([focused]):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) var(
--mod-button-focus-ring-color,var(--spectrum-button-focus-indicator-color)
)}:host(:focus-visible):after,:host([focused]):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) var(
--mod-button-focus-ring-color,var(--spectrum-button-focus-indicator-color)
)}:host{transition:border-color var(
--mod-button-animation-duration,var(--spectrum-button-animation-duration)
) ease-in-out}:host:after{border-radius:var(
--mod-button-focus-ring-border-radius,var(--spectrum-button-focus-ring-border-radius)
);content:"";inset:0;margin:calc((var(
--mod-button-focus-ring-gap,
var(--spectrum-button-focus-ring-gap)
) + var(
--mod-button-border-width,
var(--spectrum-button-border-width)
))*-1);pointer-events:none;position:absolute;transition:box-shadow var(
--mod-button-animation-duration,var(--spectrum-button-animation-duration)
) ease-in-out}:host(.focus-visible){box-shadow:none}:host(.focus-visible){box-shadow:none}:host(:focus-visible){box-shadow:none}:host(.focus-visible):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) var(
--highcontrast-button-focus-ring-color,var(
--mod-button-focus-ring-color,var(
--mod-button-focus-ring-color,var(--spectrum-button-focus-indicator-color)
)
)
)}:host(.focus-visible):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) var(
--highcontrast-button-focus-ring-color,var(
--mod-button-focus-ring-color,var(
--mod-button-focus-ring-color,var(--spectrum-button-focus-indicator-color)
)
)
)}:host(:focus-visible):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) var(
--highcontrast-button-focus-ring-color,var(
--mod-button-focus-ring-color,var(
--mod-button-focus-ring-color,var(--spectrum-button-focus-indicator-color)
)
)
)}:host{background-color:var(
--highcontrast-button-background-color-default,var(
--mod-button-background-color-default,var(--spectrum-button-background-color-default)
)
);border-color:var(
--highcontrast-button-border-color-default,var(
--mod-button-border-color-default,var(--spectrum-button-border-color-default)
)
);color:var(
--highcontrast-button-content-color-default,var(
--mod-button-content-color-default,var(--spectrum-button-content-color-default)
)
)}:host(:hover){background-color:var(
--highcontrast-button-background-color-hover,var(
--mod-button-background-color-hover,var(--spectrum-button-background-color-hover)
)
);border-color:var(
--highcontrast-button-border-color-hover,var(
--mod-button-border-color-hover,var(--spectrum-button-border-color-hover)
)
);color:var(
--highcontrast-button-content-color-hover,var(
--mod-button-content-color-hover,var(--spectrum-button-content-color-hover)
)
)}:host(.focus-visible){background-color:var(
--highcontrast-button-background-color-focus,var(
--mod-button-background-color-focus,var(--spectrum-button-background-color-focus)
)
);border-color:var(
--highcontrast-button-border-color-focus,var(
--mod-button-border-color-focus,var(--spectrum-button-border-color-focus)
)
);color:var(
--highcontrast-button-content-color-focus,var(
--mod-button-content-color-focus,var(--spectrum-button-content-color-focus)
)
)}:host(.focus-visible){background-color:var(
--highcontrast-button-background-color-focus,var(
--mod-button-background-color-focus,var(--spectrum-button-background-color-focus)
)
);border-color:var(
--highcontrast-button-border-color-focus,var(
--mod-button-border-color-focus,var(--spectrum-button-border-color-focus)
)
);color:var(
--highcontrast-button-content-color-focus,var(
--mod-button-content-color-focus,var(--spectrum-button-content-color-focus)
)
)}:host(:focus-visible){background-color:var(
--highcontrast-button-background-color-focus,var(
--mod-button-background-color-focus,var(--spectrum-button-background-color-focus)
)
);border-color:var(
--highcontrast-button-border-color-focus,var(
--mod-button-border-color-focus,var(--spectrum-button-border-color-focus)
)
);color:var(
--highcontrast-button-content-color-focus,var(
--mod-button-content-color-focus,var(--spectrum-button-content-color-focus)
)
)}:host([active]){background-color:var(
--highcontrast-button-background-color-down,var(
--mod-button-background-color-down,var(--spectrum-button-background-color-down)
)
);border-color:var(
--highcontrast-button-border-color-down,var(
--mod-button-border-color-down,var(--spectrum-button-border-color-down)
)
);color:var(
--highcontrast-button-content-color-down,var(
--mod-button-content-color-down,var(--spectrum-button-content-color-down)
)
)}:host([disabled]){background-color:var(
--highcontrast-button-background-color-disabled,var(
--mod-button-background-color-disabled,var(--spectrum-button-background-color-disabled)
)
);border-color:var(
--highcontrast-button-border-color-disabled,var(
--mod-button-border-color-disabled,var(--spectrum-button-border-color-disabled)
)
);color:var(
--highcontrast-button-content-color-disabled,var(
--mod-button-content-color-disabled,var(--spectrum-button-content-color-disabled)
)
)}@media (forced-colors:active){:host(.focus-visible):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) ButtonText;forced-color-adjust:none}:host(.focus-visible):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) ButtonText;forced-color-adjust:none}:host(:focus-visible):after{box-shadow:0 0 0 var(
--mod-button-focus-ring-thickness,var(--spectrum-button-focus-ring-thickness)
) ButtonText;forced-color-adjust:none}:host([variant=accent][treatment=fill]){background-color:ButtonText;color:ButtonFace}:host([variant=accent][treatment=fill][disabled]){background-color:ButtonFace;color:GrayText}:host([variant=accent][treatment=fill].focus-visible),:host([variant=accent][treatment=fill]:hover),:host([variant=accent][treatment=fill][active]),:host([variant=accent][treatment=fill][focused]){background-color:Highlight}:host([variant=accent][treatment=fill].focus-visible),:host([variant=accent][treatment=fill]:hover),:host([variant=accent][treatment=fill][active]),:host([variant=accent][treatment=fill][focused]){background-color:Highlight}:host([variant=accent][treatment=fill]:focus-visible),:host([variant=accent][treatment=fill]:hover),:host([variant=accent][treatment=fill][active]),:host([variant=accent][treatment=fill][focused]){background-color:Highlight}:host([variant=accent][treatment=fill]) #label{forced-color-adjust:none}}:host([static=white]){--spectrum-button-focus-indicator-color:var(
--mod-static-black-focus-indicator-color,var(--spectrum-static-black-focus-indicator-color)
)}:host([static=black]){--spectrum-button-focus-indicator-color:var(
--mod-static-black-focus-indicator-color,var(--spectrum-static-black-focus-indicator-color)
)}:host{--spectrum-button-background-color-default:var(
--system-spectrum-button-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-content-color-disabled
)}:host([variant=accent]){--spectrum-button-background-color-default:var(
--system-spectrum-button-accent-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-accent-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-accent-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-accent-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-accent-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-accent-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-accent-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-accent-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-accent-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-accent-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-accent-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-accent-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-accent-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-accent-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-accent-content-color-disabled
)}:host([variant=accent][treatment=outline]){--spectrum-button-background-color-default:var(
--system-spectrum-button-accent-outline-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-accent-outline-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-accent-outline-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-accent-outline-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-accent-outline-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-accent-outline-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-accent-outline-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-accent-outline-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-accent-outline-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-accent-outline-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-accent-outline-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-accent-outline-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-accent-outline-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-accent-outline-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-accent-outline-content-color-disabled
)}:host([variant=negative]){--spectrum-button-background-color-default:var(
--system-spectrum-button-negative-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-negative-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-negative-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-negative-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-negative-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-negative-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-negative-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-negative-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-negative-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-negative-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-negative-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-negative-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-negative-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-negative-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-negative-content-color-disabled
)}:host([variant=negative][treatment=outline]){--spectrum-button-background-color-default:var(
--system-spectrum-button-negative-outline-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-negative-outline-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-negative-outline-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-negative-outline-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-negative-outline-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-negative-outline-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-negative-outline-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-negative-outline-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-negative-outline-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-negative-outline-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-negative-outline-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-negative-outline-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-negative-outline-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-negative-outline-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-negative-outline-content-color-disabled
)}:host([variant=primary]){--spectrum-button-background-color-default:var(
--system-spectrum-button-primary-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-primary-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-primary-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-primary-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-primary-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-primary-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-primary-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-primary-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-primary-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-primary-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-primary-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-primary-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-primary-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-primary-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-primary-content-color-disabled
)}:host([variant=primary][treatment=outline]){--spectrum-button-background-color-default:var(
--system-spectrum-button-primary-outline-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-primary-outline-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-primary-outline-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-primary-outline-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-primary-outline-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-primary-outline-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-primary-outline-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-primary-outline-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-primary-outline-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-primary-outline-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-primary-outline-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-primary-outline-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-primary-outline-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-primary-outline-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-primary-outline-content-color-disabled
)}:host([variant=secondary]){--spectrum-button-background-color-default:var(
--system-spectrum-button-secondary-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-secondary-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-secondary-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-secondary-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-secondary-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-secondary-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-secondary-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-secondary-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-secondary-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-secondary-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-secondary-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-secondary-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-secondary-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-secondary-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-secondary-content-color-disabled
)}:host([variant=secondary][treatment=outline]){--spectrum-button-background-color-default:var(
--system-spectrum-button-secondary-outline-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-secondary-outline-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-secondary-outline-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-secondary-outline-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-secondary-outline-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-secondary-outline-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-secondary-outline-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-secondary-outline-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-secondary-outline-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-secondary-outline-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-secondary-outline-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-secondary-outline-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-secondary-outline-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-secondary-outline-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-secondary-outline-content-color-disabled
)}:host([quiet]){--spectrum-button-background-color-default:var(
--system-spectrum-button-quiet-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-quiet-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-quiet-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-quiet-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-quiet-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-quiet-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-quiet-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-quiet-border-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-quiet-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-quiet-border-color-disabled
)}:host([selected]){--spectrum-button-background-color-default:var(
--system-spectrum-button-selected-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-selected-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-selected-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-selected-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-selected-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-selected-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-selected-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-selected-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-selected-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-selected-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-selected-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-selected-content-color-focus
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-selected-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-selected-border-color-disabled
)}:host([selected][emphasized]){--spectrum-button-background-color-default:var(
--system-spectrum-button-selected-emphasized-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-selected-emphasized-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-selected-emphasized-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-selected-emphasized-background-color-focus
)}:host([static=black][quiet]){--spectrum-button-border-color-default:var(
--system-spectrum-button-staticblack-quiet-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticblack-quiet-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticblack-quiet-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticblack-quiet-border-color-focus
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticblack-quiet-border-color-disabled
)}:host([static=white][quiet]){--spectrum-button-border-color-default:var(
--system-spectrum-button-staticwhite-quiet-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticwhite-quiet-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticwhite-quiet-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticwhite-quiet-border-color-focus
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticwhite-quiet-border-color-disabled
)}:host([static=white]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticwhite-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticwhite-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticwhite-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticwhite-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-staticwhite-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticwhite-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticwhite-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticwhite-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-staticwhite-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-staticwhite-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-staticwhite-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-staticwhite-content-color-focus
);--spectrum-button-focus-indicator-color:var(
--system-spectrum-button-staticwhite-focus-indicator-color
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticwhite-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticwhite-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-staticwhite-content-color-disabled
)}:host([static=white][treatment=outline]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticwhite-outline-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticwhite-outline-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticwhite-outline-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticwhite-outline-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-staticwhite-outline-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticwhite-outline-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticwhite-outline-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticwhite-outline-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-staticwhite-outline-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-staticwhite-outline-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-staticwhite-outline-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-staticwhite-outline-content-color-focus
);--spectrum-button-focus-indicator-color:var(
--system-spectrum-button-staticwhite-outline-focus-indicator-color
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticwhite-outline-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticwhite-outline-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-staticwhite-outline-content-color-disabled
)}:host([static=white][selected]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticwhite-selected-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticwhite-selected-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticwhite-selected-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticwhite-selected-background-color-focus
);--spectrum-button-content-color-default:var(
--mod-button-static-content-color,var(--system-spectrum-button-staticwhite-selected-content-color-default)
);--spectrum-button-content-color-hover:var(
--mod-button-static-content-color,var(--system-spectrum-button-staticwhite-selected-content-color-hover)
);--spectrum-button-content-color-down:var(
--mod-button-static-content-color,var(--system-spectrum-button-staticwhite-selected-content-color-down)
);--spectrum-button-content-color-focus:var(
--mod-button-static-content-color,var(--system-spectrum-button-staticwhite-selected-content-color-focus)
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticwhite-selected-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticwhite-selected-border-color-disabled
)}:host([static=white][variant=secondary]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticwhite-secondary-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticwhite-secondary-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticwhite-secondary-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticwhite-secondary-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-staticwhite-secondary-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticwhite-secondary-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticwhite-secondary-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticwhite-secondary-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-staticwhite-secondary-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-staticwhite-secondary-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-staticwhite-secondary-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-staticwhite-secondary-content-color-focus
);--spectrum-button-focus-indicator-color:var(
--system-spectrum-button-staticwhite-secondary-focus-indicator-color
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticwhite-secondary-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticwhite-secondary-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-staticwhite-secondary-content-color-disabled
)}:host([static=white][variant=secondary][treatment=outline]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticwhite-secondary-outline-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticwhite-secondary-outline-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticwhite-secondary-outline-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticwhite-secondary-outline-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-staticwhite-secondary-outline-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticwhite-secondary-outline-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticwhite-secondary-outline-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticwhite-secondary-outline-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-staticwhite-secondary-outline-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-staticwhite-secondary-outline-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-staticwhite-secondary-outline-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-staticwhite-secondary-outline-content-color-focus
);--spectrum-button-focus-indicator-color:var(
--system-spectrum-button-staticwhite-secondary-outline-focus-indicator-color
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticwhite-secondary-outline-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticwhite-secondary-outline-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-staticwhite-secondary-outline-content-color-disabled
)}:host([static=black]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticblack-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticblack-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticblack-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticblack-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-staticblack-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticblack-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticblack-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticblack-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-staticblack-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-staticblack-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-staticblack-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-staticblack-content-color-focus
);--spectrum-button-focus-indicator-color:var(
--system-spectrum-button-staticblack-focus-indicator-color
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticblack-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticblack-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-staticblack-content-color-disabled
)}:host([static=black][treatment=outline]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticblack-outline-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticblack-outline-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticblack-outline-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticblack-outline-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-staticblack-outline-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticblack-outline-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticblack-outline-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticblack-outline-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-staticblack-outline-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-staticblack-outline-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-staticblack-outline-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-staticblack-outline-content-color-focus
);--spectrum-button-focus-indicator-color:var(
--system-spectrum-button-staticblack-outline-focus-indicator-color
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticblack-outline-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticblack-outline-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-staticblack-outline-content-color-disabled
)}:host([static=black][variant=secondary]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticblack-secondary-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticblack-secondary-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticblack-secondary-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticblack-secondary-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-staticblack-secondary-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticblack-secondary-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticblack-secondary-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticblack-secondary-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-staticblack-secondary-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-staticblack-secondary-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-staticblack-secondary-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-staticblack-secondary-content-color-focus
);--spectrum-button-focus-indicator-color:var(
--system-spectrum-button-staticblack-secondary-focus-indicator-color
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticblack-secondary-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticblack-secondary-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-staticblack-secondary-content-color-disabled
)}:host([static=black][variant=secondary][treatment=outline]){--spectrum-button-background-color-default:var(
--system-spectrum-button-staticblack-secondary-outline-background-color-default
);--spectrum-button-background-color-hover:var(
--system-spectrum-button-staticblack-secondary-outline-background-color-hover
);--spectrum-button-background-color-down:var(
--system-spectrum-button-staticblack-secondary-outline-background-color-down
);--spectrum-button-background-color-focus:var(
--system-spectrum-button-staticblack-secondary-outline-background-color-focus
);--spectrum-button-border-color-default:var(
--system-spectrum-button-staticblack-secondary-outline-border-color-default
);--spectrum-button-border-color-hover:var(
--system-spectrum-button-staticblack-secondary-outline-border-color-hover
);--spectrum-button-border-color-down:var(
--system-spectrum-button-staticblack-secondary-outline-border-color-down
);--spectrum-button-border-color-focus:var(
--system-spectrum-button-staticblack-secondary-outline-border-color-focus
);--spectrum-button-content-color-default:var(
--system-spectrum-button-staticblack-secondary-outline-content-color-default
);--spectrum-button-content-color-hover:var(
--system-spectrum-button-staticblack-secondary-outline-content-color-hover
);--spectrum-button-content-color-down:var(
--system-spectrum-button-staticblack-secondary-outline-content-color-down
);--spectrum-button-content-color-focus:var(
--system-spectrum-button-staticblack-secondary-outline-content-color-focus
);--spectrum-button-focus-indicator-color:var(
--system-spectrum-button-staticblack-secondary-outline-focus-indicator-color
);--spectrum-button-background-color-disabled:var(
--system-spectrum-button-staticblack-secondary-outline-background-color-disabled
);--spectrum-button-border-color-disabled:var(
--system-spectrum-button-staticblack-secondary-outline-border-color-disabled
);--spectrum-button-content-color-disabled:var(
--system-spectrum-button-staticblack-secondary-outline-content-color-disabled
)}@media (forced-colors:active){:host([treatment][disabled]){border-color:graytext}:host([treatment]:not([disabled]):hover){border-color:highlight}}::slotted([slot=icon]){inset:unset}
`,Do=Object.defineProperty,Po=Object.getOwnPropertyDescriptor,Ht=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?Po(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&Do(t,e,s),s};const Oo=["accent","primary","secondary","negative","white","black"];class kt extends R(lt){constructor(){super(...arguments),this._variant="accent",this.treatment="fill"}static get styles(){return[...super.styles,Bo]}get variant(){return this._variant}set variant(t){if(t!==this.variant){switch(this.requestUpdate("variant",this.variant),t){case"cta":this._variant="accent";break;case"overBackground":return this.removeAttribute("variant"),this.static="white",void(this.treatment="outline");case"white":case"black":return this.static=t,void this.removeAttribute("variant");case null:return;default:Oo.includes(t)?this._variant=t:this._variant="accent"}this.setAttribute("variant",this.variant)}}set quiet(t){this.treatment=t?"outline":"fill"}firstUpdated(t){super.firstUpdated(t),this.hasAttribute("variant")||this.setAttribute("variant",this.variant)}}Ht([l()],kt.prototype,"variant",1),Ht([l({type:String,reflect:!0})],kt.prototype,"static",2),Ht([l({reflect:!0})],kt.prototype,"treatment",2),Ht([l({type:Boolean})],kt.prototype,"quiet",1);class ir extends lt{}var Uo=p`
:host{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;align-items:center;-webkit-appearance:button;border-style:solid;box-sizing:border-box;cursor:pointer;display:inline-flex;font-family:var(
--spectrum-alias-body-text-font-family,var(--spectrum-global-font-family-base)
);justify-content:center;line-height:var(
--spectrum-alias-component-text-line-height,var(--spectrum-global-font-line-height-small)
);overflow:visible;position:relative;text-decoration:none;text-transform:none;transition:background var(--spectrum-global-animation-duration-100,.13s) ease-out,border-color var(--spectrum-global-animation-duration-100,.13s) ease-out,color var(--spectrum-global-animation-duration-100,.13s) ease-out,box-shadow var(--spectrum-global-animation-duration-100,.13s) ease-out;-webkit-user-select:none;user-select:none;vertical-align:top}:host(:focus){outline:none}:host([disabled]){cursor:default}:host{background-color:#0000;border:none;border-radius:100%;margin:0;padding:var(--spectrum-clearbutton-padding)}.icon{margin:0 auto}:host([size=s]){--spectrum-clearbutton-fill-uiicon-color-disabled:var(
--spectrum-clearbutton-s-fill-uiicon-color-disabled,var(--spectrum-alias-component-icon-color-disabled)
);--spectrum-clearbutton-fill-background-color-disabled:var(
--spectrum-clearbutton-s-fill-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);--spectrum-clearbutton-fill-uiicon-color:var(
--spectrum-clearbutton-s-fill-uiicon-color,var(--spectrum-alias-component-icon-color-default)
);--spectrum-clearbutton-fill-background-color:var(
--spectrum-clearbutton-s-fill-background-color,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-default
)
);--spectrum-clearbutton-fill-uiicon-color-down:var(
--spectrum-clearbutton-s-fill-uiicon-color-down,var(--spectrum-alias-component-icon-color-down)
);--spectrum-clearbutton-fill-background-color-down:var(
--spectrum-clearbutton-s-fill-background-color-down,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-down
)
);--spectrum-clearbutton-fill-background-color-hover:var(
--spectrum-clearbutton-s-fill-background-color-hover,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-hover
)
);--spectrum-clearbutton-fill-uiicon-color-key-focus:var(
--spectrum-clearbutton-s-fill-uiicon-color-key-focus,var(--spectrum-alias-component-icon-color-key-focus)
);--spectrum-clearbutton-fill-background-color-key-focus:var(
--spectrum-clearbutton-s-fill-background-color-key-focus,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-key-focus
)
);--spectrum-clearbutton-fill-size:var(
--spectrum-clearbutton-s-fill-size,var(--spectrum-alias-infieldbutton-full-height-s)
);--spectrum-clearbutton-padding:var(
--spectrum-clearbutton-s-padding,var(--spectrum-alias-infieldbutton-padding-s)
)}:host([size=m]){--spectrum-clearbutton-fill-uiicon-color-disabled:var(
--spectrum-clearbutton-m-fill-uiicon-color-disabled,var(--spectrum-alias-component-icon-color-disabled)
);--spectrum-clearbutton-fill-background-color-disabled:var(
--spectrum-clearbutton-m-fill-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);--spectrum-clearbutton-fill-uiicon-color:var(
--spectrum-clearbutton-m-fill-uiicon-color,var(--spectrum-alias-component-icon-color-default)
);--spectrum-clearbutton-fill-background-color:var(
--spectrum-clearbutton-m-fill-background-color,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-default
)
);--spectrum-clearbutton-fill-uiicon-color-down:var(
--spectrum-clearbutton-m-fill-uiicon-color-down,var(--spectrum-alias-component-icon-color-down)
);--spectrum-clearbutton-fill-background-color-down:var(
--spectrum-clearbutton-m-fill-background-color-down,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-down
)
);--spectrum-clearbutton-fill-background-color-hover:var(
--spectrum-clearbutton-m-fill-background-color-hover,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-hover
)
);--spectrum-clearbutton-fill-uiicon-color-key-focus:var(
--spectrum-clearbutton-m-fill-uiicon-color-key-focus,var(--spectrum-alias-component-icon-color-key-focus)
);--spectrum-clearbutton-fill-background-color-key-focus:var(
--spectrum-clearbutton-m-fill-background-color-key-focus,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-key-focus
)
);--spectrum-clearbutton-fill-size:var(
--spectrum-clearbutton-m-fill-size,var(--spectrum-alias-infieldbutton-full-height-m)
);--spectrum-clearbutton-padding:var(
--spectrum-clearbutton-m-padding,var(--spectrum-alias-infieldbutton-padding-m)
)}:host([size=l]){--spectrum-clearbutton-fill-uiicon-color-disabled:var(
--spectrum-clearbutton-l-fill-uiicon-color-disabled,var(--spectrum-alias-component-icon-color-disabled)
);--spectrum-clearbutton-fill-background-color-disabled:var(
--spectrum-clearbutton-l-fill-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);--spectrum-clearbutton-fill-uiicon-color:var(
--spectrum-clearbutton-l-fill-uiicon-color,var(--spectrum-alias-component-icon-color-default)
);--spectrum-clearbutton-fill-background-color:var(
--spectrum-clearbutton-l-fill-background-color,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-default
)
);--spectrum-clearbutton-fill-uiicon-color-down:var(
--spectrum-clearbutton-l-fill-uiicon-color-down,var(--spectrum-alias-component-icon-color-down)
);--spectrum-clearbutton-fill-background-color-down:var(
--spectrum-clearbutton-l-fill-background-color-down,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-down
)
);--spectrum-clearbutton-fill-background-color-hover:var(
--spectrum-clearbutton-l-fill-background-color-hover,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-hover
)
);--spectrum-clearbutton-fill-uiicon-color-key-focus:var(
--spectrum-clearbutton-l-fill-uiicon-color-key-focus,var(--spectrum-alias-component-icon-color-key-focus)
);--spectrum-clearbutton-fill-background-color-key-focus:var(
--spectrum-clearbutton-l-fill-background-color-key-focus,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-key-focus
)
);--spectrum-clearbutton-fill-size:var(
--spectrum-clearbutton-l-fill-size,var(--spectrum-alias-infieldbutton-full-height-l)
);--spectrum-clearbutton-padding:var(
--spectrum-clearbutton-l-padding,var(--spectrum-alias-infieldbutton-padding-l)
)}:host([size=xl]){--spectrum-clearbutton-fill-uiicon-color-disabled:var(
--spectrum-clearbutton-xl-fill-uiicon-color-disabled,var(--spectrum-alias-component-icon-color-disabled)
);--spectrum-clearbutton-fill-background-color-disabled:var(
--spectrum-clearbutton-xl-fill-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);--spectrum-clearbutton-fill-uiicon-color:var(
--spectrum-clearbutton-xl-fill-uiicon-color,var(--spectrum-alias-component-icon-color-default)
);--spectrum-clearbutton-fill-background-color:var(
--spectrum-clearbutton-xl-fill-background-color,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-default
)
);--spectrum-clearbutton-fill-uiicon-color-down:var(
--spectrum-clearbutton-xl-fill-uiicon-color-down,var(--spectrum-alias-component-icon-color-down)
);--spectrum-clearbutton-fill-background-color-down:var(
--spectrum-clearbutton-xl-fill-background-color-down,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-down
)
);--spectrum-clearbutton-fill-background-color-hover:var(
--spectrum-clearbutton-xl-fill-background-color-hover,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-hover
)
);--spectrum-clearbutton-fill-uiicon-color-key-focus:var(
--spectrum-clearbutton-xl-fill-uiicon-color-key-focus,var(--spectrum-alias-component-icon-color-key-focus)
);--spectrum-clearbutton-fill-background-color-key-focus:var(
--spectrum-clearbutton-xl-fill-background-color-key-focus,var(
--spectrum-alias-infieldbutton-fill-loudnessLow-background-color-key-focus
)
);--spectrum-clearbutton-fill-size:var(
--spectrum-clearbutton-xl-fill-size,var(--spectrum-alias-infieldbutton-full-height-xl)
);--spectrum-clearbutton-padding:var(
--spectrum-clearbutton-xl-padding,var(--spectrum-alias-infieldbutton-padding-xl)
)}.fill{align-items:center;background-color:var(--spectrum-clearbutton-fill-background-color);border-radius:100%;display:flex;height:var(--spectrum-clearbutton-fill-size);justify-content:center;width:var(--spectrum-clearbutton-fill-size)}:host{color:var(
--spectrum-clearbutton-m-fill-uiicon-color,var(--spectrum-alias-component-icon-color-default)
)}:host(:hover){color:var(--spectrum-clearbutton-fill-uiicon-color)}:host([active]){color:var(--spectrum-clearbutton-fill-uiicon-color-down)}:host(.focus-visible){color:var(--spectrum-clearbutton-fill-uiicon-color-key-focus)}:host(.focus-visible){color:var(--spectrum-clearbutton-fill-uiicon-color-key-focus)}:host(:focus-visible){color:var(--spectrum-clearbutton-fill-uiicon-color-key-focus)}:host([disabled]){color:var(--spectrum-clearbutton-fill-uiicon-color-disabled)}:host(:hover) .fill{background-color:var(--spectrum-clearbutton-fill-background-color-hover)}:host([active]) .fill{background-color:var(--spectrum-clearbutton-fill-background-color-down)}:host(.focus-visible) .fill{background-color:var(
--spectrum-clearbutton-fill-background-color-key-focus
)}:host(.focus-visible) .fill{background-color:var(
--spectrum-clearbutton-fill-background-color-key-focus
)}:host(:focus-visible) .fill{background-color:var(
--spectrum-clearbutton-fill-background-color-key-focus
)}:host([disabled]) .fill{background-color:var(
--spectrum-clearbutton-fill-background-color-disabled
)}:host([variant=overBackground]){color:var(
--spectrum-alias-icon-color-overbackground,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground]:hover){color:var(
--spectrum-alias-icon-color-overbackground,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground][active]){color:var(
--spectrum-alias-icon-color-overbackground,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground].focus-visible){color:var(
--spectrum-alias-icon-color-overbackground,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground].focus-visible){color:var(
--spectrum-alias-icon-color-overbackground,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground]:focus-visible){color:var(
--spectrum-alias-icon-color-overbackground,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground][disabled]),:host([variant=overBackground][disabled]) .fill{background-color:var(
--spectrum-alias-icon-color-overbackground-disabled,#fff3
)}:host([variant=overBackground]){background-color:var(
--spectrum-button-m-primary-outline-white-texticon-background-color,var(--spectrum-alias-background-color-transparent)
);border-color:var(
--spectrum-button-m-primary-outline-white-texticon-border-color,var(--spectrum-global-color-static-white)
);color:var(
--spectrum-button-m-primary-outline-white-texticon-text-color,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground]:hover){background-color:var(
--spectrum-button-m-primary-outline-white-texticon-background-color-hover,var(--spectrum-global-color-static-transparent-white-300)
);border-color:var(
--spectrum-button-m-primary-outline-white-texticon-border-color-hover,var(--spectrum-global-color-static-white)
);color:var(
--spectrum-button-m-primary-outline-white-texticon-text-color-hover,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground].focus-visible){background-color:var(
--spectrum-button-m-primary-outline-white-texticon-background-color-hover,var(--spectrum-global-color-static-transparent-white-300)
);border-color:var(
--spectrum-button-m-primary-outline-white-texticon-border-color-hover,var(--spectrum-global-color-static-white)
);box-shadow:none;color:var(
--spectrum-button-m-primary-outline-white-texticon-text-color-hover,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground].focus-visible){background-color:var(
--spectrum-button-m-primary-outline-white-texticon-background-color-hover,var(--spectrum-global-color-static-transparent-white-300)
);border-color:var(
--spectrum-button-m-primary-outline-white-texticon-border-color-hover,var(--spectrum-global-color-static-white)
);box-shadow:none;color:var(
--spectrum-button-m-primary-outline-white-texticon-text-color-hover,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground]:focus-visible){background-color:var(
--spectrum-button-m-primary-outline-white-texticon-background-color-hover,var(--spectrum-global-color-static-transparent-white-300)
);border-color:var(
--spectrum-button-m-primary-outline-white-texticon-border-color-hover,var(--spectrum-global-color-static-white)
);box-shadow:none;color:var(
--spectrum-button-m-primary-outline-white-texticon-text-color-hover,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground].focus-visible):after{box-shadow:0 0 0 var(
--spectrum-alias-focus-ring-size,var(--spectrum-global-dimension-static-size-25)
) var(
--spectrum-button-m-primary-outline-white-texticon-border-color-key-focus,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground].focus-visible):after{box-shadow:0 0 0 var(
--spectrum-alias-focus-ring-size,var(--spectrum-global-dimension-static-size-25)
) var(
--spectrum-button-m-primary-outline-white-texticon-border-color-key-focus,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground]:focus-visible):after{box-shadow:0 0 0 var(
--spectrum-alias-focus-ring-size,var(--spectrum-global-dimension-static-size-25)
) var(
--spectrum-button-m-primary-outline-white-texticon-border-color-key-focus,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground][active]){background-color:var(
--spectrum-button-m-primary-outline-white-texticon-background-color-down,var(--spectrum-global-color-static-transparent-white-400)
);border-color:var(
--spectrum-button-m-primary-outline-white-texticon-border-color-down,var(--spectrum-global-color-static-white)
);color:var(
--spectrum-button-m-primary-outline-white-texticon-text-color-down,var(--spectrum-global-color-static-white)
)}:host([variant=overBackground][disabled]){background-color:var(
--spectrum-button-m-primary-outline-white-texticon-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);border-color:var(
--spectrum-button-m-primary-outline-white-texticon-border-color-disabled,var(--spectrum-global-color-static-transparent-white-200)
);color:var(
--spectrum-button-m-primary-outline-white-texticon-text-color-disabled,var(--spectrum-global-color-static-transparent-white-500)
)}@media (-ms-high-contrast:none),screen and (-ms-high-contrast:active){.icon{margin:0}}@media (forced-colors:active){:host{--spectrum-alias-icon-color-overbackground:ButtonText;--spectrum-alias-icon-color-overbackground-disabled:GrayText;--spectrum-button-m-primary-outline-white-texticon-background-color:ButtonFace;--spectrum-button-m-primary-outline-white-texticon-background-color-disabled:ButtonFace;--spectrum-button-m-primary-outline-white-texticon-background-color-down:ButtonFace;--spectrum-button-m-primary-outline-white-texticon-background-color-hover:ButtonFace;--spectrum-button-m-primary-outline-white-texticon-border-color:ButtonText;--spectrum-button-m-primary-outline-white-texticon-border-color-disabled:GrayText;--spectrum-button-m-primary-outline-white-texticon-border-color-down:ButtonText;--spectrum-button-m-primary-outline-white-texticon-border-color-hover:ButtonText;--spectrum-button-m-primary-outline-white-texticon-border-color-key-focus:ButtonText;--spectrum-button-m-primary-outline-white-texticon-text-color:ButtonText;--spectrum-button-m-primary-outline-white-texticon-text-color-disabled:GrayText;--spectrum-button-m-primary-outline-white-texticon-text-color-down:Highlight;--spectrum-button-m-primary-outline-white-texticon-text-color-hover:Highlight;--spectrum-clearbutton-fill-background-color:ButtonFace;--spectrum-clearbutton-fill-background-color-disabled:ButtonFace;--spectrum-clearbutton-fill-background-color-down:ButtonFace;--spectrum-clearbutton-fill-background-color-hover:ButtonFace;--spectrum-clearbutton-fill-background-color-key-focus:ButtonFace;--spectrum-clearbutton-fill-uiicon-color:ButtonText;--spectrum-clearbutton-fill-uiicon-color-disabled:GrayText;--spectrum-clearbutton-fill-uiicon-color-down:Highlight;--spectrum-clearbutton-fill-uiicon-color-key-focus:Highlight;--spectrum-clearbutton-m-fill-uiicon-color:ButtonText}:host(:hover){color:var(--spectrum-clearbutton-fill-uiicon-color-key-focus)}:host([disabled]){color:var(--spectrum-clearbutton-fill-uiicon-color-disabled)}}
`,Xo=p`
:host{fill:currentColor;color:inherit;display:inline-block;pointer-events:none}:host(:not(:root)){overflow:hidden}@media (forced-colors:active){:host{forced-color-adjust:auto}}:host{--spectrum-icon-size-s:var(
--spectrum-alias-workflow-icon-size-s,var(--spectrum-global-dimension-size-200)
);--spectrum-icon-size-m:var(
--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225)
);--spectrum-icon-size-l:var(--spectrum-alias-workflow-icon-size-l);--spectrum-icon-size-xl:var(
--spectrum-alias-workflow-icon-size-xl,var(--spectrum-global-dimension-size-275)
);--spectrum-icon-size-xxl:var(--spectrum-global-dimension-size-400)}:host([size=s]){height:var(--spectrum-icon-size-s);width:var(--spectrum-icon-size-s)}:host([size=m]){height:var(--spectrum-icon-size-m);width:var(--spectrum-icon-size-m)}:host([size=l]){height:var(--spectrum-icon-size-l);width:var(--spectrum-icon-size-l)}:host([size=xl]){height:var(--spectrum-icon-size-xl);width:var(--spectrum-icon-size-xl)}:host([size=xxl]){height:var(--spectrum-icon-size-xxl);width:var(--spectrum-icon-size-xxl)}:host{height:var(
--spectrum-icon-tshirt-size-height,var(
--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)
)
);width:var(
--spectrum-icon-tshirt-size-width,var(
--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)
)
)}#container{height:100%}::slotted(*),img,svg{color:inherit;height:100%;vertical-align:top;width:100%}@media (forced-colors:active){::slotted(*),img,svg{forced-color-adjust:auto}}
`,Ro=Object.defineProperty,No=Object.getOwnPropertyDescriptor,nr=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?No(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&Ro(t,e,s),s};class B extends L{static get styles(){return[Xo]}render(){return u`
            <slot></slot>
        `}}let le;nr([l()],B.prototype,"label",2),nr([l({reflect:!0})],B.prototype,"size",2);const J=function(r,...t){return le?le(r,...t):t.reduce((e,o,a)=>e+o+r[a+1],r[0])},tt=r=>{le=r};customElements.define("sp-icon-cross75",class extends B{render(){return tt(u),(({width:r=24,height:t=24,title:e="Cross75"}={})=>J`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 8 8"
    aria-hidden="true"
    role="img"
    fill="currentColor"
    aria-label=${e}
    width=${r}
    height=${t}
  >
    <path
      d="M5.188 4l2.14-2.14A.84.84 0 106.141.672L4 2.812 1.86.672A.84.84 0 00.672 1.86L2.812 4 .672 6.14A.84.84 0 101.86 7.328L4 5.188l2.14 2.14A.84.84 0 107.328 6.14z"
    />
  </svg>`)()}}),customElements.define("sp-icon-cross100",class extends B{render(){return tt(u),(({width:r=24,height:t=24,title:e="Cross100"}={})=>J`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 8 8"
    aria-hidden="true"
    role="img"
    fill="currentColor"
    aria-label=${e}
    width=${r}
    height=${t}
  >
    <path
      d="M5.238 4l2.456-2.457A.875.875 0 106.456.306L4 2.763 1.543.306A.875.875 0 00.306 1.544L2.763 4 .306 6.457a.875.875 0 101.238 1.237L4 5.237l2.456 2.457a.875.875 0 101.238-1.237z"
    />
  </svg>`)()}}),customElements.define("sp-icon-cross200",class extends B{render(){return tt(u),(({width:r=24,height:t=24,title:e="Cross200"}={})=>J`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 10 10"
    aria-hidden="true"
    role="img"
    fill="currentColor"
    aria-label=${e}
    width=${r}
    height=${t}
  >
    <path
      d="M6.29 5l2.922-2.922a.911.911 0 00-1.29-1.29L5 3.712 2.078.789a.911.911 0 00-1.29 1.289L3.712 5 .79 7.922a.911.911 0 101.289 1.29L5 6.288 7.923 9.21a.911.911 0 001.289-1.289z"
    />
  </svg>`)()}}),customElements.define("sp-icon-cross300",class extends B{render(){return tt(u),(({width:r=24,height:t=24,title:e="Cross300"}={})=>J`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    aria-hidden="true"
    role="img"
    fill="currentColor"
    aria-label=${e}
    width=${r}
    height=${t}
  >
    <path
      d="M7.344 6l3.395-3.396a.95.95 0 00-1.344-1.342L6 4.657 2.604 1.262a.95.95 0 00-1.342 1.342L4.657 6 1.262 9.396a.95.95 0 001.343 1.343L6 7.344l3.395 3.395a.95.95 0 001.344-1.344z"
    />
  </svg>`)()}});var lr=p`
.spectrum-UIIcon-Cross75{height:var(--spectrum-alias-ui-icon-cross-size-75);width:var(--spectrum-alias-ui-icon-cross-size-75)}.spectrum-UIIcon-Cross100{height:var(--spectrum-alias-ui-icon-cross-size-100);width:var(--spectrum-alias-ui-icon-cross-size-100)}.spectrum-UIIcon-Cross200{height:var(--spectrum-alias-ui-icon-cross-size-200);width:var(--spectrum-alias-ui-icon-cross-size-200)}.spectrum-UIIcon-Cross300{height:var(--spectrum-alias-ui-icon-cross-size-300);width:var(--spectrum-alias-ui-icon-cross-size-300)}.spectrum-UIIcon-Cross400{height:var(--spectrum-alias-ui-icon-cross-size-400);width:var(--spectrum-alias-ui-icon-cross-size-400)}.spectrum-UIIcon-Cross500{height:var(--spectrum-alias-ui-icon-cross-size-500);width:var(--spectrum-alias-ui-icon-cross-size-500)}.spectrum-UIIcon-Cross600{height:var(--spectrum-alias-ui-icon-cross-size-600);width:var(--spectrum-alias-ui-icon-cross-size-600)}
`,Fo=Object.defineProperty,Go=Object.getOwnPropertyDescriptor;const Vo={s:()=>u`
        <sp-icon-cross75
            slot="icon"
            class="icon spectrum-UIIcon-Cross75"
        ></sp-icon-cross75>
    `,m:()=>u`
        <sp-icon-cross100
            slot="icon"
            class="icon spectrum-UIIcon-Cross100"
        ></sp-icon-cross100>
    `,l:()=>u`
        <sp-icon-cross200
            slot="icon"
            class="icon spectrum-UIIcon-Cross200"
        ></sp-icon-cross200>
    `,xl:()=>u`
        <sp-icon-cross300
            slot="icon"
            class="icon spectrum-UIIcon-Cross300"
        ></sp-icon-cross300>
    `};class ur extends R(ir){constructor(){super(...arguments),this.variant=""}static get styles(){return[...super.styles,Uo,lr]}get buttonContent(){return[Vo[this.size]()]}render(){return u`
            <div class="fill">${super.render()}</div>
        `}}((r,t,e,o)=>{for(var a,s=o>1?void 0:o?Go(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);o&&s&&Fo(t,e,s)})([l({reflect:!0})],ur.prototype,"variant",2);var Ko=p`
:host{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-appearance:button;border-style:solid;box-sizing:border-box;cursor:pointer;font-family:var(--mod-font-family-base,var(--spectrum-font-family-base));line-height:var(
--mod-line-height-small,var(--spectrum-line-height-small)
);margin:0;overflow:visible;text-decoration:none;text-transform:none;transition:background var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,border-color var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,color var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,box-shadow var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out;-webkit-user-select:none;user-select:none;vertical-align:top}:host(:focus){outline:none}:host([disabled]){cursor:default}:host a{-webkit-appearance:none;-webkit-user-select:none;user-select:none}:host{--spectrum-closebutton-size-300:24px;--spectrum-closebutton-size-400:32px;--spectrum-closebutton-size-500:40px;--spectrum-closebutton-size-600:48px;--spectrum-closebutton-icon-color-default:var(
--spectrum-neutral-content-color-default
);--spectrum-closebutton-icon-color-hover:var(
--spectrum-neutral-content-color-hover
);--spectrum-closebutton-icon-color-down:var(
--spectrum-neutral-content-color-down
);--spectrum-closebutton-icon-color-focus:var(
--spectrum-neutral-content-color-key-focus
);--spectrum-closebutton-icon-color-disabled:var(
--spectrum-disabled-content-color
);--spectrum-closebutton-focus-indicator-thickness:var(
--spectrum-focus-indicator-thickness
);--spectrum-closebutton-focus-indicator-gap:var(
--spectrum-focus-indicator-gap
);--spectrum-closebutton-focus-indicator-color:var(
--spectrum-focus-indicator-color
);--spectrum-closebutton-height:var(--spectrum-component-height-100);--spectrum-closebutton-width:var(--spectrum-closebutton-height);--spectrum-closebutton-size:var(--spectrum-closebutton-size-400);--spectrum-closebutton-border-radius:var(--spectrum-closebutton-size-400);--spectrum-closebutton-animation-duration:var(
--spectrum-animation-duration-100
)}:host([size=s]){--spectrum-closebutton-height:var(--spectrum-component-height-75);--spectrum-closebutton-width:var(--spectrum-closebutton-height);--spectrum-closebutton-size:var(--spectrum-closebutton-size-300);--spectrum-closebutton-border-radius:var(--spectrum-closebutton-size-300)}:host([size=m]){--spectrum-closebutton-height:var(--spectrum-component-height-100);--spectrum-closebutton-width:var(--spectrum-closebutton-height);--spectrum-closebutton-size:var(--spectrum-closebutton-size-400);--spectrum-closebutton-border-radius:var(--spectrum-closebutton-size-400)}:host([size=l]){--spectrum-closebutton-height:var(--spectrum-component-height-200);--spectrum-closebutton-width:var(--spectrum-closebutton-height);--spectrum-closebutton-size:var(--spectrum-closebutton-size-500);--spectrum-closebutton-border-radius:var(--spectrum-closebutton-size-500)}:host([size=xl]){--spectrum-closebutton-height:var(--spectrum-component-height-300);--spectrum-closebutton-width:var(--spectrum-closebutton-height);--spectrum-closebutton-size:var(--spectrum-closebutton-size-600);--spectrum-closebutton-border-radius:var(--spectrum-closebutton-size-600)}:host([variant=white]){--spectrum-closebutton-static-background-color-default:transparent;--spectrum-closebutton-static-background-color-hover:var(
--spectrum-transparent-white-300
);--spectrum-closebutton-static-background-color-down:var(
--spectrum-transparent-white-400
);--spectrum-closebutton-static-background-color-focus:var(
--spectrum-transparent-white-300
);--spectrum-closebutton-icon-color-default:var(--spectrum-white);--spectrum-closebutton-icon-color-disabled:var(
--spectrum-disabled-static-white-content-color
);--spectrum-closebutton-focus-indicator-color:var(
--spectrum-static-white-focus-indicator-color
)}:host([variant=black]){--spectrum-closebutton-static-background-color-default:transparent;--spectrum-closebutton-static-background-color-hover:var(
--spectrum-transparent-black-300
);--spectrum-closebutton-static-background-color-down:var(
--spectrum-transparent-black-400
);--spectrum-closebutton-static-background-color-focus:var(
--spectrum-transparent-black-300
);--spectrum-closebutton-icon-color-default:var(--spectrum-black);--spectrum-closebutton-icon-color-disabled:var(
--spectrum-disabled-static-black-content-color
);--spectrum-closebutton-focus-indicator-color:var(
--spectrum-static-black-focus-indicator-color
)}@media (forced-colors:active){:host{--highcontrast-closebutton-icon-color-disabled:GrayText;--highcontrast-closebutton-icon-color-down:Highlight;--highcontrast-closebutton-icon-color-hover:Highlight;--highcontrast-closebutton-icon-color-focus:Highlight;--highcontrast-closebutton-background-color-default:ButtonFace;--highcontrast-closebutton-focus-indicator-color:ButtonText}:host(.focus-visible):after{border-radius:100%;box-shadow:0 0 0 var(
--mod-closebutton-focus-indicator-thickness,var(--spectrum-closebutton-focus-indicator-thickness)
) var(
--highcontrast-closebutton-focus-indicator-color,var(
--mod-closebutton-focus-indicator-color,var(--spectrum-closebutton-focus-indicator-color)
)
);content:"";display:block;forced-color-adjust:none;inset:0;margin:var(
--mod-closebutton-focus-indicator-gap,var(--spectrum-closebutton-focus-indicator-gap)
);position:absolute;transition:opacity var(
--mod-closebutton-animation-duration,var(--spectrum-closebutton-animation-duration)
) ease-out,margin var(
--mod-closebutton-animation-duraction,var(--spectrum-closebutton-animation-duration)
) ease-out}:host(.focus-visible):after{border-radius:100%;box-shadow:0 0 0 var(
--mod-closebutton-focus-indicator-thickness,var(--spectrum-closebutton-focus-indicator-thickness)
) var(
--highcontrast-closebutton-focus-indicator-color,var(
--mod-closebutton-focus-indicator-color,var(--spectrum-closebutton-focus-indicator-color)
)
);content:"";display:block;forced-color-adjust:none;inset:0;margin:var(
--mod-closebutton-focus-indicator-gap,var(--spectrum-closebutton-focus-indicator-gap)
);position:absolute;transition:opacity var(
--mod-closebutton-animation-duration,var(--spectrum-closebutton-animation-duration)
) ease-out,margin var(
--mod-closebutton-animation-duraction,var(--spectrum-closebutton-animation-duration)
) ease-out}:host(:focus-visible):after{border-radius:100%;box-shadow:0 0 0 var(
--mod-closebutton-focus-indicator-thickness,var(--spectrum-closebutton-focus-indicator-thickness)
) var(
--highcontrast-closebutton-focus-indicator-color,var(
--mod-closebutton-focus-indicator-color,var(--spectrum-closebutton-focus-indicator-color)
)
);content:"";display:block;forced-color-adjust:none;inset:0;margin:var(
--mod-closebutton-focus-indicator-gap,var(--spectrum-closebutton-focus-indicator-gap)
);position:absolute;transition:opacity var(
--mod-closebutton-animation-duration,var(--spectrum-closebutton-animation-duration)
) ease-out,margin var(
--mod-closebutton-animation-duraction,var(--spectrum-closebutton-animation-duration)
) ease-out}:host([variant=black]){--highcontrast-closebutton-static-background-color-default:ButtonFace;--highcontrast-closebutton-icon-color-default:Highlight;--highcontrast-closebutton-icon-color-disabled:GrayText}:host([variant=white]){--highcontrast-closebutton-static-background-color-default:ButtonFace;--highcontrast-closebutton-icon-color-default:Highlight;--highcontrast-closebutton-icon-color-disabled:Highlight}}:host{align-items:center;border-color:#0000;border-radius:var(
--mod-closebutton-border-radius,var(--spectrum-closebutton-border-radius)
);border-width:0;color:inherit;display:inline-flex;flex-direction:row;height:var(--mod-closebutton-height,var(--spectrum-closebutton-height));justify-content:center;padding:0;position:relative;transition:border-color var(
--mod-closebutton-animation-duration,var(--spectrum-closebutton-animation-duration)
) ease-in-out;width:var(--mod-closebutton-width,var(--spectrum-closebutton-width))}:host:after{border-radius:calc(var(--mod-closebutton-size, var(--spectrum-closebutton-size)) + var(
--mod-closebutton-focus-indicator-gap,
var(--spectrum-closebutton-focus-indicator-gap)
));content:"";inset:0;margin:calc(var(
--mod-closebutton-focus-indicator-gap,
var(--spectrum-closebutton-focus-indicator-gap)
)*-1);pointer-events:none;position:absolute;transition:box-shadow var(
--mod-closebutton-animation-duration,var(--spectrum-closebutton-animation-duration)
) ease-in-out}:host(.focus-visible){box-shadow:none}:host(.focus-visible){box-shadow:none}:host(:focus-visible){box-shadow:none}:host(.focus-visible):after{box-shadow:0 0 0 var(
--mod-closebutton-focus-indicator-thickness,var(--spectrum-closebutton-focus-indicator-thickness)
) var(
--highcontrast-closebutton-focus-indicator-color,var(
--mod-closebutton-focus-indicator-color,var(--spectrum-closebutton-focus-indicator-color)
)
)}:host(.focus-visible):after{box-shadow:0 0 0 var(
--mod-closebutton-focus-indicator-thickness,var(--spectrum-closebutton-focus-indicator-thickness)
) var(
--highcontrast-closebutton-focus-indicator-color,var(
--mod-closebutton-focus-indicator-color,var(--spectrum-closebutton-focus-indicator-color)
)
)}:host(:focus-visible):after{box-shadow:0 0 0 var(
--mod-closebutton-focus-indicator-thickness,var(--spectrum-closebutton-focus-indicator-thickness)
) var(
--highcontrast-closebutton-focus-indicator-color,var(
--mod-closebutton-focus-indicator-color,var(--spectrum-closebutton-focus-indicator-color)
)
)}:host(:not([disabled])){background-color:var(
--highcontrast-closebutton-background-color-default,var(
--mod-closebutton-background-color-default,var(--spectrum-closebutton-background-color-default)
)
)}:host(:not([disabled]):hover){background-color:var(
--mod-closebutton-background-color-hover,var(--spectrum-closebutton-background-color-hover)
)}:host(:not([disabled]):hover) .icon{color:var(
--highcontrast-closebutton-icon-color-hover,var(
--mod-closebutton-icon-color-hover,var(--spectrum-closebutton-icon-color-hover)
)
)}:host(:not([disabled])[active]){background-color:var(
--mod-closebutton-background-color-down,var(--spectrum-closebutton-background-color-down)
)}:host(:not([disabled])[active]) .icon{color:var(
--highcontrast-closebutton-icon-color-down,var(
--mod-closebutton-icon-color-down,var(--spectrum-closebutton-icon-color-down)
)
)}:host(:not([disabled]).focus-visible),:host(:not([disabled])[focused]){background-color:var(
--mod-closebutton-background-color-focus,var(--spectrum-closebutton-background-color-focus)
)}:host(:not([disabled]).focus-visible),:host(:not([disabled])[focused]){background-color:var(
--mod-closebutton-background-color-focus,var(--spectrum-closebutton-background-color-focus)
)}:host(:not([disabled]):focus-visible),:host(:not([disabled])[focused]){background-color:var(
--mod-closebutton-background-color-focus,var(--spectrum-closebutton-background-color-focus)
)}:host(:not([disabled]).focus-visible) .icon,:host(:not([disabled])[focused]) .icon{color:var(
--highcontrast-closebutton-icon-color-focus,var(
--mod-closebutton-icon-color-focus,var(--spectrum-closebutton-icon-color-focus)
)
)}:host(:not([disabled]).focus-visible) .icon,:host(:not([disabled])[focused]) .icon{color:var(
--highcontrast-closebutton-icon-color-focus,var(
--mod-closebutton-icon-color-focus,var(--spectrum-closebutton-icon-color-focus)
)
)}:host(:not([disabled]):focus-visible) .icon,:host(:not([disabled])[focused]) .icon{color:var(
--highcontrast-closebutton-icon-color-focus,var(
--mod-closebutton-icon-color-focus,var(--spectrum-closebutton-icon-color-focus)
)
)}:host(:not([disabled])) .icon{color:var(
--mod-closebutton-icon-color-default,var(--spectrum-closebutton-icon-color-default)
)}:host(:not([disabled]):focus) .icon,:host(:not([disabled])[focused]) .icon{color:var(
--highcontrast-closebutton-icon-color-focus,var(
--mod-closebutton-icon-color-focus,var(--spectrum-closebutton-icon-color-focus)
)
)}:host([disabled]){background-color:var(
--mod-closebutton-background-color-default,var(--spectrum-closebutton-background-color-default)
)}:host([disabled]) .icon{color:var(
--highcontrast-closebutton-icon-color-disabled,var(
--mod-closebutton-icon-color-disabled,var(--spectrum-closebutton-icon-color-disabled)
)
)}:host([variant=black]:not([disabled])),:host([variant=white]:not([disabled])){background-color:var(
--highcontrast-closebutton-static-background-color-default,var(
--mod-closebutton-static-background-color-default,var(--spectrum-closebutton-static-background-color-default)
)
)}:host([variant=black]:not([disabled]):hover),:host([variant=white]:not([disabled]):hover){background-color:var(
--highcontrast-closebutton-static-background-color-hover,var(
--mod-closebutton-static-background-color-hover,var(--spectrum-closebutton-static-background-color-hover)
)
)}:host([variant=black]:not([disabled]):hover) .icon,:host([variant=white]:not([disabled]):hover) .icon{color:var(
--highcontrast-closebutton-icon-color-default,var(
--mod-closebutton-icon-color-default,var(--spectrum-closebutton-icon-color-default)
)
)}:host([variant=black]:not([disabled])[active]),:host([variant=white]:not([disabled])[active]){background-color:var(
--highcontrast-closebutton-static-background-color-down,var(
--mod-closebutton-static-background-color-down,var(--spectrum-closebutton-static-background-color-down)
)
)}:host([variant=black]:not([disabled])[active]) .icon,:host([variant=white]:not([disabled])[active]) .icon{color:var(
--highcontrast-closebutton-icon-color-default,var(
--mod-closebutton-icon-color-default,var(--spectrum-closebutton-icon-color-default)
)
)}:host([variant=black]:not([disabled]).focus-visible),:host([variant=black]:not([disabled])[focused]),:host([variant=white]:not([disabled]).focus-visible),:host([variant=white]:not([disabled])[focused]){background-color:var(
--highcontrast-closebutton-static-background-color-focus,var(
--mod-closebutton-static-background-color-focus,var(--spectrum-closebutton-static-background-color-focus)
)
)}:host([variant=black]:not([disabled]).focus-visible),:host([variant=black]:not([disabled])[focused]),:host([variant=white]:not([disabled]).focus-visible),:host([variant=white]:not([disabled])[focused]){background-color:var(
--highcontrast-closebutton-static-background-color-focus,var(
--mod-closebutton-static-background-color-focus,var(--spectrum-closebutton-static-background-color-focus)
)
)}:host([variant=black]:not([disabled]):focus-visible),:host([variant=black]:not([disabled])[focused]),:host([variant=white]:not([disabled]):focus-visible),:host([variant=white]:not([disabled])[focused]){background-color:var(
--highcontrast-closebutton-static-background-color-focus,var(
--mod-closebutton-static-background-color-focus,var(--spectrum-closebutton-static-background-color-focus)
)
)}:host([variant=black]:not([disabled]).focus-visible) .icon,:host([variant=black]:not([disabled]):focus) .icon,:host([variant=black]:not([disabled])[focused]) .icon,:host([variant=white]:not([disabled]).focus-visible) .icon,:host([variant=white]:not([disabled]):focus) .icon,:host([variant=white]:not([disabled])[focused]) .icon{color:var(
--highcontrast-closebutton-icon-color-default,var(
--mod-closebutton-icon-color-default,var(--spectrum-closebutton-icon-color-default)
)
)}:host([variant=black]:not([disabled]):focus) .icon,:host([variant=black]:not([disabled]):focus-visible) .icon,:host([variant=black]:not([disabled])[focused]) .icon,:host([variant=white]:not([disabled]):focus) .icon,:host([variant=white]:not([disabled]):focus-visible) .icon,:host([variant=white]:not([disabled])[focused]) .icon{color:var(
--highcontrast-closebutton-icon-color-default,var(
--mod-closebutton-icon-color-default,var(--spectrum-closebutton-icon-color-default)
)
)}:host([variant=black]:not([disabled])) .icon,:host([variant=white]:not([disabled])) .icon{color:var(
--mod-closebutton-icon-color-default,var(--spectrum-closebutton-icon-color-default)
)}:host([variant=black][disabled]) .icon,:host([variant=white][disabled]) .icon{color:var(
--highcontrast-closebutton-icon-disabled,var(
--mod-closebutton-icon-color-disabled,var(--spectrum-closebutton-icon-color-disabled)
)
)}.icon{margin:0}:host{--spectrum-closebutton-background-color-default:var(
--system-spectrum-closebutton-background-color-default
);--spectrum-closebutton-background-color-hover:var(
--system-spectrum-closebutton-background-color-hover
);--spectrum-closebutton-background-color-down:var(
--system-spectrum-closebutton-background-color-down
);--spectrum-closebutton-background-color-focus:var(
--system-spectrum-closebutton-background-color-focus
)}
`,Zo=Object.defineProperty,Wo=Object.getOwnPropertyDescriptor;const Qo={s:()=>u`
        <sp-icon-cross75
            slot="icon"
            class="icon spectrum-UIIcon-Cross75"
        ></sp-icon-cross75>
    `,m:()=>u`
        <sp-icon-cross100
            slot="icon"
            class="icon spectrum-UIIcon-Cross100"
        ></sp-icon-cross100>
    `,l:()=>u`
        <sp-icon-cross200
            slot="icon"
            class="icon spectrum-UIIcon-Cross200"
        ></sp-icon-cross200>
    `,xl:()=>u`
        <sp-icon-cross300
            slot="icon"
            class="icon spectrum-UIIcon-Cross300"
        ></sp-icon-cross300>
    `};class mr extends R(ir){constructor(){super(...arguments),this.variant=""}static get styles(){return[...super.styles,Ko,lr]}get buttonContent(){return[Qo[this.size]()]}}((r,t,e,o)=>{for(var a,s=o>1?void 0:o?Wo(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);o&&s&&Zo(t,e,s)})([l({reflect:!0})],mr.prototype,"variant",2);var Yo=p`
:host{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;align-items:center;-webkit-appearance:button;border-style:solid;box-sizing:border-box;cursor:pointer;display:inline-flex;font-family:var(
--mod-sans-font-family-stack,var(--spectrum-sans-font-family-stack)
);justify-content:center;line-height:var(--mod-line-height-100,var(--spectrum-line-height-100));margin:0;overflow:visible;text-decoration:none;text-transform:none;transition:background var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,border-color var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,color var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out,box-shadow var(
--mod-animation-duration-100,var(--spectrum-animation-duration-100)
) ease-out;-webkit-user-select:none;user-select:none;vertical-align:top}:host(:focus){outline:none}:host([disabled]){cursor:default}::slotted([slot=icon]){max-block-size:100%}#label{place-self:center;text-align:center}#label:empty{display:none}:host{--spectrum-actionbutton-animation-duration:var(
--spectrum-animation-duration-100
);--spectrum-actionbutton-border-radius:var(--spectrum-corner-radius-100);--spectrum-actionbutton-border-width:var(--spectrum-border-width-100);--spectrum-actionbutton-focus-indicator-gap:var(
--spectrum-focus-indicator-gap
);--spectrum-actionbutton-focus-indicator-thickness:var(
--spectrum-focus-indicator-thickness
);--spectrum-actionbutton-focus-indicator-color:var(
--spectrum-focus-indicator-color
);--spectrum-actionbutton-focus-indicator-border-radius:calc(var(--spectrum-actionbutton-border-radius) + var(--spectrum-actionbutton-focus-indicator-gap))}:host([size=xs]){--spectrum-actionbutton-min-width:calc(var(--spectrum-component-edge-to-visual-only-75)*2 + var(--spectrum-workflow-icon-size-75));--spectrum-actionbutton-height:var(--spectrum-component-height-50);--spectrum-actionbutton-icon-size:var(--spectrum-workflow-icon-size-50);--spectrum-actionbutton-font-size:var(--spectrum-font-size-50);--spectrum-actionbutton-text-to-visual:var(--spectrum-text-to-visual-50);--spectrum-actionbutton-edge-to-hold-icon:var(
--spectrum-action-button-edge-to-hold-icon-extra-small
);--spectrum-actionbutton-edge-to-visual:calc(var(--spectrum-component-edge-to-visual-50) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-text:calc(var(--spectrum-component-edge-to-text-50) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-visual-only:calc(var(--spectrum-component-edge-to-visual-only-50) - var(--spectrum-actionbutton-border-width))}:host([size=s]){--spectrum-actionbutton-min-width:calc(var(--spectrum-component-edge-to-visual-only-75)*2 + var(--spectrum-workflow-icon-size-75));--spectrum-actionbutton-height:var(--spectrum-component-height-75);--spectrum-actionbutton-icon-size:var(--spectrum-workflow-icon-size-75);--spectrum-actionbutton-font-size:var(--spectrum-font-size-75);--spectrum-actionbutton-text-to-visual:var(--spectrum-text-to-visual-75);--spectrum-actionbutton-edge-to-hold-icon:var(
--spectrum-action-button-edge-to-hold-icon-small
);--spectrum-actionbutton-edge-to-visual:calc(var(--spectrum-component-edge-to-visual-75) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-text:calc(var(--spectrum-component-edge-to-text-75) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-visual-only:calc(var(--spectrum-component-edge-to-visual-only-75) - var(--spectrum-actionbutton-border-width))}:host([size=m]){--spectrum-actionbutton-min-width:calc(var(--spectrum-component-edge-to-visual-only-100)*2 + var(--spectrum-workflow-icon-size-100));--spectrum-actionbutton-height:var(--spectrum-component-height-100);--spectrum-actionbutton-icon-size:var(--spectrum-workflow-icon-size-100);--spectrum-actionbutton-font-size:var(--spectrum-font-size-100);--spectrum-actionbutton-text-to-visual:var(--spectrum-text-to-visual-100);--spectrum-actionbutton-edge-to-hold-icon:var(
--spectrum-action-button-edge-to-hold-icon-medium
);--spectrum-actionbutton-edge-to-visual:calc(var(--spectrum-component-edge-to-visual-100) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-text:calc(var(--spectrum-component-edge-to-text-100) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-visual-only:calc(var(--spectrum-component-edge-to-visual-only-100) - var(--spectrum-actionbutton-border-width))}:host([size=l]){--spectrum-actionbutton-min-width:calc(var(--spectrum-component-edge-to-visual-only-200)*2 + var(--spectrum-workflow-icon-size-200));--spectrum-actionbutton-height:var(--spectrum-component-height-200);--spectrum-actionbutton-icon-size:var(--spectrum-workflow-icon-size-200);--spectrum-actionbutton-font-size:var(--spectrum-font-size-200);--spectrum-actionbutton-text-to-visual:var(--spectrum-text-to-visual-200);--spectrum-actionbutton-edge-to-hold-icon:var(
--spectrum-action-button-edge-to-hold-icon-large
);--spectrum-actionbutton-edge-to-visual:calc(var(--spectrum-component-edge-to-visual-200) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-text:calc(var(--spectrum-component-edge-to-text-200) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-visual-only:calc(var(--spectrum-component-edge-to-visual-only-200) - var(--spectrum-actionbutton-border-width))}:host([size=xl]){--spectrum-actionbutton-min-width:calc(var(--spectrum-component-edge-to-visual-only-300)*2 + var(--spectrum-workflow-icon-size-300));--spectrum-actionbutton-height:var(--spectrum-component-height-300);--spectrum-actionbutton-icon-size:var(--spectrum-workflow-icon-size-300);--spectrum-actionbutton-font-size:var(--spectrum-font-size-300);--spectrum-actionbutton-text-to-visual:var(--spectrum-text-to-visual-300);--spectrum-actionbutton-edge-to-hold-icon:var(
--spectrum-action-button-edge-to-hold-icon-extra-large
);--spectrum-actionbutton-edge-to-visual:calc(var(--spectrum-component-edge-to-visual-300) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-text:calc(var(--spectrum-component-edge-to-text-300) - var(--spectrum-actionbutton-border-width));--spectrum-actionbutton-edge-to-visual-only:calc(var(--spectrum-component-edge-to-visual-only-300) - var(--spectrum-actionbutton-border-width))}@media (forced-colors:active){:host{--highcontrast-actionbutton-focus-indicator-color:ButtonText}:host:after{forced-color-adjust:none}:host([selected]){--highcontrast-actionbutton-background-color-default:Highlight;--highcontrast-actionbutton-background-color-hover:Highlight;--highcontrast-actionbutton-background-color-focus:Highlight;--highcontrast-actionbutton-background-color-down:Highlight;--highcontrast-actionbutton-background-color-disabled:ButtonFace;--highcontrast-actionbutton-border-color-default:HighlightText;--highcontrast-actionbutton-border-color-hover:HighlightText;--highcontrast-actionbutton-border-color-focus:HighlightText;--highcontrast-actionbutton-border-color-down:HighlightText;--highcontrast-actionbutton-border-color-disabled:GrayText;--highcontrast-actionbutton-content-color-default:HighlightText;--highcontrast-actionbutton-content-color-hover:HighlightText;--highcontrast-actionbutton-content-color-focus:HighlightText;--highcontrast-actionbutton-content-color-down:HighlightText;--highcontrast-actionbutton-content-color-disabled:GrayText}:host([selected]) #label,:host([selected]) .hold-affordance,:host([selected]) ::slotted([slot=icon]){forced-color-adjust:none}}:host{background-color:var(
--highcontrast-actionbutton-background-color-default,var(
--mod-actionbutton-background-color-default,var(--spectrum-actionbutton-background-color-default)
)
);border-color:var(
--highcontrast-actionbutton-border-color-default,var(
--mod-actionbutton-border-color-default,var(--spectrum-actionbutton-border-color-default)
)
);border-radius:var(
--mod-actionbutton-border-radius,var(--spectrum-actionbutton-border-radius)
);border-width:var(
--mod-actionbutton-border-width,var(--spectrum-actionbutton-border-width)
);color:var(
--highcontrast-actionbutton-content-color-default,var(
--mod-actionbutton-content-color-default,var(--spectrum-actionbutton-content-color-default)
)
);gap:calc(var(
--mod-actionbutton-text-to-visual,
var(--spectrum-actionbutton-text-to-visual)
) + var(
--mod-actionbutton-edge-to-text,
var(--spectrum-actionbutton-edge-to-text)
) - var(
--mod-actionbutton-edge-to-visual-only,
var(--spectrum-actionbutton-edge-to-visual-only)
));height:var(--mod-actionbutton-height,var(--spectrum-actionbutton-height));min-inline-size:var(
--mod-actionbutton-min-width,var(--spectrum-actionbutton-min-width)
);padding-inline:var(
--mod-actionbutton-edge-to-text,var(--spectrum-actionbutton-edge-to-text)
);position:relative}:host(:hover){background-color:var(
--highcontrast-actionbutton-background-color-hover,var(
--mod-actionbutton-background-color-hover,var(--spectrum-actionbutton-background-color-hover)
)
);border-color:var(
--highcontrast-actionbutton-border-color-hover,var(
--mod-actionbutton-border-color-hover,var(--spectrum-actionbutton-border-color-hover)
)
);color:var(
--highcontrast-actionbutton-content-color-hover,var(
--mod-actionbutton-content-color-hover,var(--spectrum-actionbutton-content-color-hover)
)
)}:host(.focus-visible){background-color:var(
--highcontrast-actionbutton-background-color-focus,var(
--mod-actionbutton-background-color-focus,var(--spectrum-actionbutton-background-color-focus)
)
);border-color:var(
--highcontrast-actionbutton-border-color-focus,var(
--mod-actionbutton-border-color-focus,var(--spectrum-actionbutton-border-color-focus)
)
);color:var(
--highcontrast-actionbutton-content-color-focus,var(
--mod-actionbutton-content-color-focus,var(--spectrum-actionbutton-content-color-focus)
)
)}:host(.focus-visible){background-color:var(
--highcontrast-actionbutton-background-color-focus,var(
--mod-actionbutton-background-color-focus,var(--spectrum-actionbutton-background-color-focus)
)
);border-color:var(
--highcontrast-actionbutton-border-color-focus,var(
--mod-actionbutton-border-color-focus,var(--spectrum-actionbutton-border-color-focus)
)
);color:var(
--highcontrast-actionbutton-content-color-focus,var(
--mod-actionbutton-content-color-focus,var(--spectrum-actionbutton-content-color-focus)
)
)}:host(:focus-visible){background-color:var(
--highcontrast-actionbutton-background-color-focus,var(
--mod-actionbutton-background-color-focus,var(--spectrum-actionbutton-background-color-focus)
)
);border-color:var(
--highcontrast-actionbutton-border-color-focus,var(
--mod-actionbutton-border-color-focus,var(--spectrum-actionbutton-border-color-focus)
)
);color:var(
--highcontrast-actionbutton-content-color-focus,var(
--mod-actionbutton-content-color-focus,var(--spectrum-actionbutton-content-color-focus)
)
)}:host([active]){background-color:var(
--highcontrast-actionbutton-background-color-down,var(
--mod-actionbutton-background-color-down,var(--spectrum-actionbutton-background-color-down)
)
);border-color:var(
--highcontrast-actionbutton-border-color-down,var(
--mod-actionbutton-border-color-down,var(--spectrum-actionbutton-border-color-down)
)
);color:var(
--highcontrast-actionbutton-content-color-down,var(
--mod-actionbutton-content-color-down,var(--spectrum-actionbutton-content-color-down)
)
)}:host([disabled]){background-color:var(
--highcontrast-actionbutton-background-color-disabled,var(
--mod-actionbutton-background-color-disabled,var(--spectrum-actionbutton-background-color-disabled)
)
);border-color:var(
--highcontrast-actionbutton-border-color-disabled,var(
--mod-actionbutton-border-color-disabled,var(--spectrum-actionbutton-border-color-disabled)
)
);color:var(
--highcontrast-actionbutton-content-color-disabled,var(
--mod-actionbutton-content-color-disabled,var(--spectrum-actionbutton-content-color-disabled)
)
)}::slotted([slot=icon]){color:inherit;height:var(
--mod-actionbutton-icon-size,var(--spectrum-actionbutton-icon-size)
);margin-inline-end:calc(var(
--mod-actionbutton-edge-to-visual-only,
var(--spectrum-actionbutton-edge-to-visual-only)
) - var(
--mod-actionbutton-edge-to-text,
var(--spectrum-actionbutton-edge-to-text)
));margin-inline-start:calc(var(
--mod-actionbutton-edge-to-visual,
var(--spectrum-actionbutton-edge-to-visual)
) - var(
--mod-actionbutton-edge-to-text,
var(--spectrum-actionbutton-edge-to-text)
));width:var(
--mod-actionbutton-icon-size,var(--spectrum-actionbutton-icon-size)
)}.hold-affordance+::slotted([slot=icon]),[icon-only]::slotted([slot=icon]){margin-inline-start:calc(var(
--mod-actionbutton-edge-to-visual-only,
var(--spectrum-actionbutton-edge-to-visual-only)
) - var(
--mod-actionbutton-edge-to-text,
var(--spectrum-actionbutton-edge-to-text)
))}#label{color:inherit;font-size:var(
--mod-actionbutton-font-size,var(--spectrum-actionbutton-font-size)
);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host([dir=rtl]) .hold-affordance{transform:matrix(-1,0,0,1,0,0)}.hold-affordance{color:inherit;inset-block-end:calc(var(
--mod-actionbutton-edge-to-hold-icon,
var(--spectrum-actionbutton-edge-to-hold-icon)
) - var(
--mod-actionbutton-border-width,
var(--spectrum-actionbutton-border-width)
));inset-inline-end:calc(var(
--mod-actionbutton-edge-to-hold-icon,
var(--spectrum-actionbutton-edge-to-hold-icon)
) - var(
--mod-actionbutton-border-width,
var(--spectrum-actionbutton-border-width)
));position:absolute}:host{transition:border-color var(
--mod-actionbutton-animation-duration,var(--spectrum-actionbutton-animation-duration)
) ease-in-out}:host:after{border-radius:var(
--mod-actionbutton-focus-indicator-border-radius,var(--spectrum-actionbutton-focus-indicator-border-radius)
);content:"";inset:0;margin:calc((var(
--mod-actionbutton-focus-indicator-gap,
var(--spectrum-actionbutton-focus-indicator-gap)
) + var(
--mod-actionbutton-border-width,
var(--spectrum-actionbutton-border-width)
))*-1);pointer-events:none;position:absolute;transition:box-shadow var(
--mod-actionbutton-animation-duration,var(--spectrum-actionbutton-animation-duration)
) ease-in-out}:host(.focus-visible){box-shadow:none}:host(.focus-visible){box-shadow:none}:host(:focus-visible){box-shadow:none}:host(.focus-visible):after{box-shadow:0 0 0 var(
--mod-actionbutton-focus-indicator-thickness,var(--spectrum-actionbutton-focus-indicator-thickness)
) var(
--highcontrast-actionbutton-focus-indicator-color,var(
--mod-actionbutton-focus-indicator-color,var(--spectrum-actionbutton-focus-indicator-color)
)
)}:host(.focus-visible):after{box-shadow:0 0 0 var(
--mod-actionbutton-focus-indicator-thickness,var(--spectrum-actionbutton-focus-indicator-thickness)
) var(
--highcontrast-actionbutton-focus-indicator-color,var(
--mod-actionbutton-focus-indicator-color,var(--spectrum-actionbutton-focus-indicator-color)
)
)}:host(:focus-visible):after{box-shadow:0 0 0 var(
--mod-actionbutton-focus-indicator-thickness,var(--spectrum-actionbutton-focus-indicator-thickness)
) var(
--highcontrast-actionbutton-focus-indicator-color,var(
--mod-actionbutton-focus-indicator-color,var(--spectrum-actionbutton-focus-indicator-color)
)
)}:host{--spectrum-actionbutton-background-color-default:var(
--system-spectrum-actionbutton-background-color-default
);--spectrum-actionbutton-background-color-hover:var(
--system-spectrum-actionbutton-background-color-hover
);--spectrum-actionbutton-background-color-down:var(
--system-spectrum-actionbutton-background-color-down
);--spectrum-actionbutton-background-color-focus:var(
--system-spectrum-actionbutton-background-color-focus
);--spectrum-actionbutton-border-color-default:var(
--system-spectrum-actionbutton-border-color-default
);--spectrum-actionbutton-border-color-hover:var(
--system-spectrum-actionbutton-border-color-hover
);--spectrum-actionbutton-border-color-down:var(
--system-spectrum-actionbutton-border-color-down
);--spectrum-actionbutton-border-color-focus:var(
--system-spectrum-actionbutton-border-color-focus
);--spectrum-actionbutton-content-color-default:var(
--system-spectrum-actionbutton-content-color-default
);--spectrum-actionbutton-content-color-hover:var(
--system-spectrum-actionbutton-content-color-hover
);--spectrum-actionbutton-content-color-down:var(
--system-spectrum-actionbutton-content-color-down
);--spectrum-actionbutton-content-color-focus:var(
--system-spectrum-actionbutton-content-color-focus
);--spectrum-actionbutton-background-color-disabled:var(
--system-spectrum-actionbutton-background-color-disabled
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-border-color-disabled
);--spectrum-actionbutton-content-color-disabled:var(
--system-spectrum-actionbutton-content-color-disabled
)}:host([quiet]){--spectrum-actionbutton-background-color-default:var(
--system-spectrum-actionbutton-quiet-background-color-default
);--spectrum-actionbutton-background-color-hover:var(
--system-spectrum-actionbutton-quiet-background-color-hover
);--spectrum-actionbutton-background-color-down:var(
--system-spectrum-actionbutton-quiet-background-color-down
);--spectrum-actionbutton-background-color-focus:var(
--system-spectrum-actionbutton-quiet-background-color-focus
);--spectrum-actionbutton-border-color-default:var(
--system-spectrum-actionbutton-quiet-border-color-default
);--spectrum-actionbutton-border-color-hover:var(
--system-spectrum-actionbutton-quiet-border-color-hover
);--spectrum-actionbutton-border-color-down:var(
--system-spectrum-actionbutton-quiet-border-color-down
);--spectrum-actionbutton-border-color-focus:var(
--system-spectrum-actionbutton-quiet-border-color-focus
);--spectrum-actionbutton-background-color-disabled:var(
--system-spectrum-actionbutton-quiet-background-color-disabled
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-quiet-border-color-disabled
)}:host([selected]){--spectrum-actionbutton-background-color-default:var(
--system-spectrum-actionbutton-selected-background-color-default
);--spectrum-actionbutton-background-color-hover:var(
--system-spectrum-actionbutton-selected-background-color-hover
);--spectrum-actionbutton-background-color-down:var(
--system-spectrum-actionbutton-selected-background-color-down
);--spectrum-actionbutton-background-color-focus:var(
--system-spectrum-actionbutton-selected-background-color-focus
);--spectrum-actionbutton-border-color-default:var(
--system-spectrum-actionbutton-selected-border-color-default
);--spectrum-actionbutton-border-color-hover:var(
--system-spectrum-actionbutton-selected-border-color-hover
);--spectrum-actionbutton-border-color-down:var(
--system-spectrum-actionbutton-selected-border-color-down
);--spectrum-actionbutton-border-color-focus:var(
--system-spectrum-actionbutton-selected-border-color-focus
);--spectrum-actionbutton-content-color-default:var(
--system-spectrum-actionbutton-selected-content-color-default
);--spectrum-actionbutton-content-color-hover:var(
--system-spectrum-actionbutton-selected-content-color-hover
);--spectrum-actionbutton-content-color-down:var(
--system-spectrum-actionbutton-selected-content-color-down
);--spectrum-actionbutton-content-color-focus:var(
--system-spectrum-actionbutton-selected-content-color-focus
);--spectrum-actionbutton-background-color-disabled:var(
--system-spectrum-actionbutton-selected-background-color-disabled
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-selected-border-color-disabled
)}:host([selected][emphasized]){--spectrum-actionbutton-background-color-default:var(
--system-spectrum-actionbutton-selected-emphasized-background-color-default
);--spectrum-actionbutton-background-color-hover:var(
--system-spectrum-actionbutton-selected-emphasized-background-color-hover
);--spectrum-actionbutton-background-color-down:var(
--system-spectrum-actionbutton-selected-emphasized-background-color-down
);--spectrum-actionbutton-background-color-focus:var(
--system-spectrum-actionbutton-selected-emphasized-background-color-focus
)}:host([variant=black][quiet]){--spectrum-actionbutton-border-color-default:var(
--system-spectrum-actionbutton-staticblack-quiet-border-color-default
);--spectrum-actionbutton-border-color-hover:var(
--system-spectrum-actionbutton-staticblack-quiet-border-color-hover
);--spectrum-actionbutton-border-color-down:var(
--system-spectrum-actionbutton-staticblack-quiet-border-color-down
);--spectrum-actionbutton-border-color-focus:var(
--system-spectrum-actionbutton-staticblack-quiet-border-color-focus
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-staticblack-quiet-border-color-disabled
)}:host([variant=white][quiet]){--spectrum-actionbutton-border-color-default:var(
--system-spectrum-actionbutton-staticwhite-quiet-border-color-default
);--spectrum-actionbutton-border-color-hover:var(
--system-spectrum-actionbutton-staticwhite-quiet-border-color-hover
);--spectrum-actionbutton-border-color-down:var(
--system-spectrum-actionbutton-staticwhite-quiet-border-color-down
);--spectrum-actionbutton-border-color-focus:var(
--system-spectrum-actionbutton-staticwhite-quiet-border-color-focus
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-staticwhite-quiet-border-color-disabled
)}:host([variant=black]){--spectrum-actionbutton-background-color-default:var(
--system-spectrum-actionbutton-staticblack-background-color-default
);--spectrum-actionbutton-background-color-hover:var(
--system-spectrum-actionbutton-staticblack-background-color-hover
);--spectrum-actionbutton-background-color-down:var(
--system-spectrum-actionbutton-staticblack-background-color-down
);--spectrum-actionbutton-background-color-focus:var(
--system-spectrum-actionbutton-staticblack-background-color-focus
);--spectrum-actionbutton-border-color-default:var(
--system-spectrum-actionbutton-staticblack-border-color-default
);--spectrum-actionbutton-border-color-hover:var(
--system-spectrum-actionbutton-staticblack-border-color-hover
);--spectrum-actionbutton-border-color-down:var(
--system-spectrum-actionbutton-staticblack-border-color-down
);--spectrum-actionbutton-border-color-focus:var(
--system-spectrum-actionbutton-staticblack-border-color-focus
);--spectrum-actionbutton-content-color-default:var(
--system-spectrum-actionbutton-staticblack-content-color-default
);--spectrum-actionbutton-content-color-hover:var(
--system-spectrum-actionbutton-staticblack-content-color-hover
);--spectrum-actionbutton-content-color-down:var(
--system-spectrum-actionbutton-staticblack-content-color-down
);--spectrum-actionbutton-content-color-focus:var(
--system-spectrum-actionbutton-staticblack-content-color-focus
);--spectrum-actionbutton-focus-indicator-color:var(
--system-spectrum-actionbutton-staticblack-focus-indicator-color
);--spectrum-actionbutton-background-color-disabled:var(
--system-spectrum-actionbutton-staticblack-background-color-disabled
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-staticblack-border-color-disabled
);--spectrum-actionbutton-content-color-disabled:var(
--system-spectrum-actionbutton-staticblack-content-color-disabled
)}:host([variant=black][selected]){--spectrum-actionbutton-background-color-default:var(
--system-spectrum-actionbutton-staticblack-selected-background-color-default
);--spectrum-actionbutton-background-color-hover:var(
--system-spectrum-actionbutton-staticblack-selected-background-color-hover
);--spectrum-actionbutton-background-color-down:var(
--system-spectrum-actionbutton-staticblack-selected-background-color-down
);--spectrum-actionbutton-background-color-focus:var(
--system-spectrum-actionbutton-staticblack-selected-background-color-focus
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-staticblack-selected-border-color-disabled
);--spectrum-actionbutton-content-color-default:var(
--mod-actionbutton-static-content-color,var(
--system-spectrum-actionbutton-staticblack-selected-content-color-default
)
);--spectrum-actionbutton-content-color-hover:var(
--mod-actionbutton-static-content-color,var(
--system-spectrum-actionbutton-staticblack-selected-content-color-hover
)
);--spectrum-actionbutton-content-color-down:var(
--mod-actionbutton-static-content-color,var(
--system-spectrum-actionbutton-staticblack-selected-content-color-down
)
);--spectrum-actionbutton-content-color-focus:var(
--mod-actionbutton-static-content-color,var(
--system-spectrum-actionbutton-staticblack-selected-content-color-focus
)
);--spectrum-actionbutton-background-color-disabled:var(
--system-spectrum-actionbutton-staticblack-selected-background-color-disabled
)}:host([variant=white]){--spectrum-actionbutton-background-color-default:var(
--system-spectrum-actionbutton-staticwhite-background-color-default
);--spectrum-actionbutton-background-color-hover:var(
--system-spectrum-actionbutton-staticwhite-background-color-hover
);--spectrum-actionbutton-background-color-down:var(
--system-spectrum-actionbutton-staticwhite-background-color-down
);--spectrum-actionbutton-background-color-focus:var(
--system-spectrum-actionbutton-staticwhite-background-color-focus
);--spectrum-actionbutton-border-color-default:var(
--system-spectrum-actionbutton-staticwhite-border-color-default
);--spectrum-actionbutton-border-color-hover:var(
--system-spectrum-actionbutton-staticwhite-border-color-hover
);--spectrum-actionbutton-border-color-down:var(
--system-spectrum-actionbutton-staticwhite-border-color-down
);--spectrum-actionbutton-border-color-focus:var(
--system-spectrum-actionbutton-staticwhite-border-color-focus
);--spectrum-actionbutton-content-color-default:var(
--system-spectrum-actionbutton-staticwhite-content-color-default
);--spectrum-actionbutton-content-color-hover:var(
--system-spectrum-actionbutton-staticwhite-content-color-hover
);--spectrum-actionbutton-content-color-down:var(
--system-spectrum-actionbutton-staticwhite-content-color-down
);--spectrum-actionbutton-content-color-focus:var(
--system-spectrum-actionbutton-staticwhite-content-color-focus
);--spectrum-actionbutton-focus-indicator-color:var(
--system-spectrum-actionbutton-staticwhite-focus-indicator-color
);--spectrum-actionbutton-background-color-disabled:var(
--system-spectrum-actionbutton-staticwhite-background-color-disabled
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-staticwhite-border-color-disabled
);--spectrum-actionbutton-content-color-disabled:var(
--system-spectrum-actionbutton-staticwhite-content-color-disabled
)}:host([variant=white][selected]){--spectrum-actionbutton-background-color-default:var(
--system-spectrum-actionbutton-staticwhite-selected-background-color-default
);--spectrum-actionbutton-background-color-hover:var(
--system-spectrum-actionbutton-staticwhite-selected-background-color-hover
);--spectrum-actionbutton-background-color-down:var(
--system-spectrum-actionbutton-staticwhite-selected-background-color-down
);--spectrum-actionbutton-background-color-focus:var(
--system-spectrum-actionbutton-staticwhite-selected-background-color-focus
);--spectrum-actionbutton-content-color-default:var(
--mod-actionbutton-static-content-color,var(
--system-spectrum-actionbutton-staticwhite-selected-content-color-default
)
);--spectrum-actionbutton-content-color-hover:var(
--mod-actionbutton-static-content-color,var(
--system-spectrum-actionbutton-staticwhite-selected-content-color-hover
)
);--spectrum-actionbutton-content-color-down:var(
--mod-actionbutton-static-content-color,var(
--system-spectrum-actionbutton-staticwhite-selected-content-color-down
)
);--spectrum-actionbutton-content-color-focus:var(
--mod-actionbutton-static-content-color,var(
--system-spectrum-actionbutton-staticwhite-selected-content-color-focus
)
);--spectrum-actionbutton-background-color-disabled:var(
--system-spectrum-actionbutton-staticwhite-selected-background-color-disabled
);--spectrum-actionbutton-border-color-disabled:var(
--system-spectrum-actionbutton-staticwhite-selected-border-color-disabled
)}::slotted([slot=icon]){flex-shrink:0}#label{flex-grow:var(--spectrum-actionbutton-label-flex-grow);text-align:var(--spectrum-actionbutton-label-text-align)}:host([size=xs]){min-width:var(--spectrum-actionbutton-height,0)}@media (forced-colors:active){:host{--highcontrast-actionbutton-border-color-disabled:GrayText;--highcontrast-actionbutton-content-color-disabled:GrayText}}
`,Jo=p`
.spectrum-UIIcon-CornerTriangle75{height:var(
--spectrum-alias-ui-icon-cornertriangle-size-75,var(--spectrum-global-dimension-size-65)
);width:var(
--spectrum-alias-ui-icon-cornertriangle-size-75,var(--spectrum-global-dimension-size-65)
)}.spectrum-UIIcon-CornerTriangle100{height:var(--spectrum-alias-ui-icon-cornertriangle-size-100);width:var(--spectrum-alias-ui-icon-cornertriangle-size-100)}.spectrum-UIIcon-CornerTriangle200{height:var(
--spectrum-alias-ui-icon-cornertriangle-size-200,var(--spectrum-global-dimension-size-75)
);width:var(
--spectrum-alias-ui-icon-cornertriangle-size-200,var(--spectrum-global-dimension-size-75)
)}.spectrum-UIIcon-CornerTriangle300{height:var(--spectrum-alias-ui-icon-cornertriangle-size-300);width:var(--spectrum-alias-ui-icon-cornertriangle-size-300)}
`;customElements.define("sp-icon-corner-triangle300",class extends B{render(){return tt(u),(({width:r=24,height:t=24,title:e="Corner Triangle300"}={})=>J`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 7 7"
    aria-hidden="true"
    role="img"
    fill="currentColor"
    aria-label=${e}
    width=${r}
    height=${t}
  >
    <path
      d="M6.683.67a.315.315 0 00-.223.093l-5.7 5.7a.316.316 0 00.224.54h5.7A.316.316 0 007 6.687V.986A.316.316 0 006.684.67z"
    />
  </svg>`)()}});var ts=Object.defineProperty,es=Object.getOwnPropertyDescriptor,G=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?es(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&ts(t,e,s),s};const rs={xs:"spectrum-UIIcon-CornerTriangle75",s:"spectrum-UIIcon-CornerTriangle75",m:"spectrum-UIIcon-CornerTriangle100",l:"spectrum-UIIcon-CornerTriangle200",xl:"spectrum-UIIcon-CornerTriangle300"};let pr;class D extends R(lt,{validSizes:["xs","s","m","l","xl"]}){constructor(){super(),this.emphasized=!1,this.holdAffordance=!1,this.quiet=!1,this.role="button",this.selected=!1,this.toggles=!1,this._value="",this.onClick=()=>{this.toggles&&(this.selected=!this.selected,this.dispatchEvent(new Event("change",{cancelable:!0}))||(this.selected=!this.selected))},this.addEventListener("click",this.onClick),this.addEventListener("pointerdown",this.onPointerdown)}static get styles(){return[...super.styles,Yo,Jo]}get value(){return this._value||this.itemText}set value(t){t!==this._value&&(this._value=t||"",this._value?this.setAttribute("value",this._value):this.removeAttribute("value"))}get itemText(){return(this.textContent||"").trim()}onPointerdown(t){t.button===0&&(this.addEventListener("pointerup",this.onPointerup),this.addEventListener("pointercancel",this.onPointerup),pr=setTimeout(()=>{this.dispatchEvent(new CustomEvent("longpress",{bubbles:!0,composed:!0,detail:{source:"pointer"}}))},300))}onPointerup(){clearTimeout(pr),this.removeEventListener("pointerup",this.onPointerup),this.removeEventListener("pointercancel",this.onPointerup)}handleKeydown(t){if(!this.holdAffordance)return super.handleKeydown(t);const{code:e,altKey:o}=t;(e==="Space"||o&&e==="ArrowDown")&&(t.preventDefault(),e==="ArrowDown"&&(t.stopPropagation(),t.stopImmediatePropagation()),this.addEventListener("keyup",this.handleKeyup),this.active=!0)}handleKeyup(t){if(!this.holdAffordance)return super.handleKeyup(t);const{code:e,altKey:o}=t;(e==="Space"||o&&e==="ArrowDown")&&(t.stopPropagation(),this.dispatchEvent(new CustomEvent("longpress",{bubbles:!0,composed:!0,detail:{source:"keyboard"}})),this.active=!1)}get buttonContent(){const t=super.buttonContent;return this.holdAffordance&&t.unshift(u`
                <sp-icon-corner-triangle300
                    class="hold-affordance ${rs[this.size]}"
                ></sp-icon-corner-triangle300>
            `),t}updated(t){super.updated(t);const e=this.role==="button"&&(this.selected||this.toggles);(t.has("selected")||t.has("role"))&&(e?this.setAttribute("aria-pressed",this.selected?"true":"false"):this.removeAttribute("aria-pressed"))}}G([l({type:Boolean,reflect:!0})],D.prototype,"emphasized",2),G([l({type:Boolean,reflect:!0,attribute:"hold-affordance"})],D.prototype,"holdAffordance",2),G([l({type:Boolean,reflect:!0})],D.prototype,"quiet",2),G([l({reflect:!0})],D.prototype,"role",2),G([l({type:Boolean,reflect:!0})],D.prototype,"selected",2),G([l({type:Boolean,reflect:!0})],D.prototype,"toggles",2),G([l({reflect:!0})],D.prototype,"variant",2),G([l({type:String})],D.prototype,"value",1),customElements.define("sp-action-button",D);const dr=class{constructor(r,{mode:t}={mode:"internal"}){this.mode="internal",this.handleSlotchange=({target:e})=>{this.handleHelpText(e),this.handleNegativeHelpText(e)},this.host=r,this.instanceCount=dr.instanceCount++,this.id=`sp-help-text-${this.instanceCount}`,this.mode=t}get isInternal(){return this.mode==="internal"}render(r){return u`
            <div id=${b(this.isInternal?this.id:void 0)}>
                <slot
                    name=${r?"negative-help-text":`pass-through-help-text-${this.instanceCount}`}
                    @slotchange=${this.handleSlotchange}
                >
                    <slot name="help-text"></slot>
                </slot>
            </div>
        `}addId(){const r=this.helpTextElement?this.helpTextElement.id:this.id;this.conditionId=function(t,e,o){const a=Array.isArray(o)?o:[o],s=t.getAttribute(e),c=s?s.split(/\s+/):[];return a.every(i=>c.indexOf(i)>-1)?()=>{}:(c.push(...a),t.setAttribute(e,c.join(" ")),()=>function(i,n,m){const g=i.getAttribute(n);let d=g?g.split(/\s+/):[];d=d.filter(y=>!m.find(x=>y===x)),d.length?i.setAttribute(n,d.join(" ")):i.removeAttribute(n)}(t,e,a))}(this.host,"aria-describedby",r),this.host.hasAttribute("tabindex")&&(this.previousTabindex=parseFloat(this.host.getAttribute("tabindex"))),this.host.tabIndex=0}removeId(){this.conditionId&&(this.conditionId(),delete this.conditionId),!this.helpTextElement&&(this.previousTabindex?this.host.tabIndex=this.previousTabindex:this.host.removeAttribute("tabindex"))}handleHelpText(r){if(this.isInternal)return;this.helpTextElement&&this.helpTextElement.id===this.id&&this.helpTextElement.removeAttribute("id"),this.removeId();const t=r.assignedElements()[0];this.helpTextElement=t,t&&(t.id||(t.id=this.id),this.addId())}handleNegativeHelpText(r){r.name==="negative-help-text"&&r.assignedElements().forEach(t=>t.variant="negative")}};let gr=dr;gr.instanceCount=0,customElements.define("sp-icon-checkmark100",class extends B{render(){return tt(u),(({width:r=24,height:t=24,title:e="Checkmark100"}={})=>J`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 10 10"
    aria-hidden="true"
    role="img"
    fill="currentColor"
    aria-label=${e}
    width=${r}
    height=${t}
  >
    <path
      d="M3.5 9.5a.999.999 0 01-.774-.368l-2.45-3a1 1 0 111.548-1.264l1.657 2.028 4.68-6.01A1 1 0 019.74 2.114l-5.45 7a1 1 0 01-.777.386z"
    />
  </svg>`)()}});var os=p`
:host{fill:currentColor;color:inherit;display:inline-block;pointer-events:none}:host(:not(:root)){overflow:hidden}@media (forced-colors:active){:host{forced-color-adjust:auto}}:host{--spectrum-icon-size-s:var(
--spectrum-alias-workflow-icon-size-s,var(--spectrum-global-dimension-size-200)
);--spectrum-icon-size-m:var(
--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225)
);--spectrum-icon-size-l:var(--spectrum-alias-workflow-icon-size-l);--spectrum-icon-size-xl:var(
--spectrum-alias-workflow-icon-size-xl,var(--spectrum-global-dimension-size-275)
);--spectrum-icon-size-xxl:var(--spectrum-global-dimension-size-400)}:host([size=s]){height:var(--spectrum-icon-size-s);width:var(--spectrum-icon-size-s)}:host([size=m]){height:var(--spectrum-icon-size-m);width:var(--spectrum-icon-size-m)}:host([size=l]){height:var(--spectrum-icon-size-l);width:var(--spectrum-icon-size-l)}:host([size=xl]){height:var(--spectrum-icon-size-xl);width:var(--spectrum-icon-size-xl)}:host([size=xxl]){height:var(--spectrum-icon-size-xxl);width:var(--spectrum-icon-size-xxl)}:host{height:var(
--spectrum-icon-tshirt-size-height,var(
--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)
)
);width:var(
--spectrum-icon-tshirt-size-width,var(
--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)
)
)}#container{height:100%}::slotted(*),img,svg{color:inherit;height:100%;vertical-align:top;width:100%}@media (forced-colors:active){::slotted(*),img,svg{forced-color-adjust:auto}}
`,ss=Object.defineProperty,as=Object.getOwnPropertyDescriptor,br=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?as(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&ss(t,e,s),s};class T extends L{static get styles(){return[os]}render(){return u`
            <slot></slot>
        `}}let ue;br([l()],T.prototype,"label",2),br([l({reflect:!0})],T.prototype,"size",2);const j=function(r,...t){return ue?ue(r,...t):t.reduce((e,o,a)=>e+o+r[a+1],r[0])},q=r=>{ue=r};customElements.define("sp-icon-alert",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Alert"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M17.127 2.579.4 32.512A1 1 0 0 0 1.272 34h33.456a1 1 0 0 0 .872-1.488L18.873 2.579a1 1 0 0 0-1.746 0ZM20 29.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5Zm0-6a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}});var cs=p`
:host{--spectrum-textfield-quiet-texticon-border-bottom-size:var(
--spectrum-textfield-m-quiet-texticon-border-bottom-size,var(--spectrum-alias-input-border-size)
);--spectrum-textfield-quiet-texticon-success-icon-margin-left:var(
--spectrum-textfield-m-quiet-texticon-success-icon-margin-left,var(--spectrum-global-dimension-size-150)
);--spectrum-textfield-quiet-texticon-invalid-icon-margin-left:var(
--spectrum-textfield-m-quiet-texticon-invalid-icon-margin-left,var(--spectrum-global-dimension-size-150)
);--spectrum-textfield-quiet-texticon-border-radius:var(
--spectrum-textfield-m-quiet-texticon-border-radius,var(--spectrum-global-dimension-size-0)
);--spectrum-textfield-quiet-texticon-padding-left:var(
--spectrum-textfield-m-quiet-texticon-padding-left,var(--spectrum-global-dimension-size-0)
);--spectrum-textfield-quiet-texticon-padding-right:var(
--spectrum-textfield-m-quiet-texticon-padding-right,var(--spectrum-global-dimension-size-0)
);--spectrum-textfield-texticon-border-size:var(
--spectrum-textfield-m-texticon-border-size,var(--spectrum-alias-input-border-size)
);--spectrum-textfield-texticon-text-line-height:var(
--spectrum-textfield-m-texticon-text-line-height,var(--spectrum-alias-component-text-line-height)
);--spectrum-textfield-texticon-text-size:var(
--spectrum-textfield-m-texticon-text-size,var(--spectrum-global-dimension-font-size-100)
);--spectrum-textfield-texticon-placeholder-text-font-style:var(
--spectrum-textfield-m-texticon-placeholder-text-font-style,var(--spectrum-global-font-style-italic)
);--spectrum-textfield-texticon-placeholder-text-font-weight:var(
--spectrum-textfield-m-texticon-placeholder-text-font-weight,var(--spectrum-global-font-weight-regular)
);--spectrum-textfield-texticon-success-icon-height:var(
--spectrum-textfield-m-texticon-success-icon-height,var(--spectrum-alias-ui-icon-checkmark-size-100)
);--spectrum-textfield-texticon-success-icon-width:var(
--spectrum-textfield-m-texticon-success-icon-width,var(--spectrum-alias-ui-icon-checkmark-size-100)
);--spectrum-textfield-texticon-success-icon-margin-left:var(
--spectrum-textfield-m-texticon-success-icon-margin-left,var(--spectrum-global-dimension-size-150)
);--spectrum-textfield-texticon-invalid-icon-height:var(
--spectrum-textfield-m-texticon-invalid-icon-height,var(--spectrum-alias-ui-icon-alert-size-100)
);--spectrum-textfield-texticon-invalid-icon-width:var(
--spectrum-textfield-m-texticon-invalid-icon-width,var(--spectrum-alias-ui-icon-alert-size-100)
);--spectrum-textfield-texticon-invalid-icon-margin-left:var(
--spectrum-textfield-m-texticon-invalid-icon-margin-left,var(--spectrum-global-dimension-size-150)
);--spectrum-textfield-texticon-min-width:var(
--spectrum-textfield-m-texticon-min-width,var(--spectrum-global-dimension-size-600)
);--spectrum-textfield-texticon-border-radius:var(
--spectrum-textfield-m-texticon-border-radius,var(--spectrum-alias-border-radius-regular)
);--spectrum-textfield-texticon-padding-right:var(
--spectrum-textfield-m-texticon-padding-right,var(--spectrum-global-dimension-size-150)
);--spectrum-textfield-texticon-height:var(
--spectrum-textfield-m-texticon-height,var(--spectrum-global-dimension-size-400)
);--spectrum-textarea-text-padding-top:var(
--spectrum-textarea-m-text-padding-top,var(--spectrum-global-dimension-size-75)
);--spectrum-textarea-text-padding-bottom:var(
--spectrum-textarea-m-text-padding-bottom,var(--spectrum-global-dimension-size-115)
);--spectrum-textarea-padding-left:var(
--spectrum-textarea-m-padding-left,var(--spectrum-global-dimension-size-150)
);--spectrum-textarea-padding-right:var(
--spectrum-textarea-m-padding-right,var(--spectrum-global-dimension-size-150)
);--spectrum-textarea-height:var(
--spectrum-textarea-m-height,var(--spectrum-global-dimension-size-400)
);--spectrum-textfield-texticon-padding-top:3px;--spectrum-textfield-texticon-padding-bottom:5px;--spectrum-textfield-texticon-text-font-family:var(
--spectrum-alias-body-text-font-family,var(--spectrum-global-font-family-base)
);--spectrum-textfield-texticon-icon-gap:var(
--spectrum-global-dimension-size-65
);--spectrum-textfield-quiet-texticon-icon-gap:var(
--spectrum-global-dimension-size-75
);--spectrum-textarea-min-height:var(--spectrum-textarea-height);--spectrum-textarea-height-adjusted:auto;--spectrum-textarea-padding-top:var(--spectrum-textarea-text-padding-top);--spectrum-textarea-padding-bottom:var(
--spectrum-textarea-text-padding-bottom
);--spectrum-textfield-texticon-padding-left:var(
--spectrum-alias-item-workflow-padding-left-m
)}#textfield{display:inline-flex;min-width:var(--spectrum-textfield-texticon-min-width);position:relative;width:var(
--spectrum-alias-single-line-width,var(--spectrum-global-dimension-size-2400)
)}:host([quiet][multiline]) #textfield .input{height:var(--spectrum-textfield-texticon-height);min-height:var(--spectrum-textfield-texticon-height)}#textfield:after{border-color:#0000;border-radius:calc(var(--spectrum-textfield-texticon-border-radius) + var(
--spectrum-textfield-m-texticon-focus-ring-gap,
var(--spectrum-alias-input-focusring-gap)
));content:"";inset:0;margin:calc(var(
--spectrum-textfield-m-texticon-focus-ring-gap,
var(--spectrum-alias-input-focusring-gap)
)*-1);pointer-events:none;position:absolute;transition:box-shadow var(--spectrum-global-animation-duration-100,.13s) ease-in-out,border-color var(--spectrum-global-animation-duration-100,.13s) ease-in-out}:host([quiet]) #textfield:after{border-radius:0}.input{-webkit-appearance:none;-moz-appearance:textfield;border:var(--spectrum-textfield-texticon-border-size) solid;border-radius:var(--spectrum-textfield-texticon-border-radius);box-sizing:border-box;font-family:var(--spectrum-textfield-texticon-text-font-family);font-size:var(--spectrum-textfield-texticon-text-size);height:var(--spectrum-textfield-texticon-height);line-height:var(--spectrum-textfield-texticon-text-line-height);margin:0;outline:none;overflow:visible;padding:var(--spectrum-textfield-texticon-padding-top) var(--spectrum-textfield-texticon-padding-right) var(--spectrum-textfield-texticon-padding-bottom) calc(var(--spectrum-textfield-texticon-padding-left) + 1px);text-indent:0;text-overflow:ellipsis;transition:border-color var(--spectrum-global-animation-duration-100,.13s) ease-in-out;vertical-align:top;width:100%}.input::placeholder{font-style:var(--spectrum-textfield-texticon-placeholder-text-font-style);font-weight:var(
--spectrum-textfield-texticon-placeholder-text-font-weight
);opacity:1;transition:color var(--spectrum-global-animation-duration-100,.13s) ease-in-out}.input:lang(ja)::placeholder,.input:lang(ko)::placeholder,.input:lang(zh)::placeholder{font-style:normal}.input:hover::placeholder{font-weight:var(
--spectrum-textfield-texticon-placeholder-text-font-weight
)}.input:disabled{opacity:1;resize:none}.input:disabled::placeholder{font-weight:var(
--spectrum-textfield-texticon-placeholder-text-font-weight
)}.input::-ms-clear{height:0;width:0}.input::-webkit-inner-spin-button,.input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.input:-moz-ui-invalid{box-shadow:none}:host([dir=ltr][valid]) #textfield .input{padding-right:calc(var(--spectrum-textfield-texticon-padding-right) + var(--spectrum-textfield-texticon-success-icon-width) + var(
--spectrum-textfield-icon-inline-end-override,
var(--spectrum-textfield-texticon-success-icon-margin-left)
))}:host([dir=rtl][valid]) #textfield .input{padding-left:calc(var(--spectrum-textfield-texticon-padding-right) + var(--spectrum-textfield-texticon-success-icon-width) + var(
--spectrum-textfield-icon-inline-end-override,
var(--spectrum-textfield-texticon-success-icon-margin-left)
))}:host([dir=ltr][invalid]) #textfield .input{padding-right:calc(var(--spectrum-textfield-texticon-padding-right) + var(--spectrum-textfield-texticon-invalid-icon-width) + var(
--spectrum-textfield-icon-inline-end-override,
var(--spectrum-textfield-texticon-invalid-icon-margin-left)
))}:host([dir=rtl][invalid]) #textfield .input{padding-left:calc(var(--spectrum-textfield-texticon-padding-right) + var(--spectrum-textfield-texticon-invalid-icon-width) + var(
--spectrum-textfield-icon-inline-end-override,
var(--spectrum-textfield-texticon-invalid-icon-margin-left)
))}:host([multiline]) .input{height:var(--spectrum-textarea-height-adjusted);min-height:var(--spectrum-textarea-min-height);overflow:auto;padding:var(--spectrum-textarea-padding-top) var(--spectrum-textarea-padding-right) var(--spectrum-textarea-padding-bottom) calc(var(--spectrum-textarea-padding-left) - 1px)}:host([dir=ltr][quiet]) .input{padding-left:var(--spectrum-textfield-quiet-texticon-padding-left)}:host([dir=rtl][quiet]) .input{padding-right:var(--spectrum-textfield-quiet-texticon-padding-left)}:host([dir=ltr][quiet]) .input{padding-right:var(--spectrum-textfield-quiet-texticon-padding-right)}:host([dir=rtl][quiet]) .input{padding-left:var(--spectrum-textfield-quiet-texticon-padding-right)}:host([quiet]) .input{border-bottom-width:var(
--spectrum-textfield-quiet-texticon-border-bottom-size
);border-left-width:0;border-radius:var(--spectrum-textfield-quiet-texticon-border-radius);border-right-width:0;border-top-width:0;overflow-y:hidden;resize:none}:host([dir=ltr][invalid][quiet]) .input{padding-right:calc(var(--spectrum-textfield-texticon-invalid-icon-width) + var(--spectrum-textfield-quiet-texticon-invalid-icon-margin-left))}:host([dir=rtl][invalid][quiet]) .input{padding-left:calc(var(--spectrum-textfield-texticon-invalid-icon-width) + var(--spectrum-textfield-quiet-texticon-invalid-icon-margin-left))}:host([dir=ltr][valid][quiet]) .input{padding-right:calc(var(--spectrum-textfield-texticon-success-icon-width) + var(--spectrum-textfield-quiet-texticon-success-icon-margin-left))}:host([dir=rtl][valid][quiet]) .input{padding-left:calc(var(--spectrum-textfield-texticon-success-icon-width) + var(--spectrum-textfield-quiet-texticon-success-icon-margin-left))}.icon{pointer-events:all;position:absolute}:host([dir=ltr][quiet]) .icon{padding-right:0}:host([dir=rtl][quiet]) .icon{padding-left:0}:host([dir=ltr][invalid]) #textfield .icon{right:var(
--spectrum-textfield-icon-inline-end-override,var(--spectrum-textfield-texticon-invalid-icon-margin-left)
)}:host([dir=rtl][invalid]) #textfield .icon{left:var(
--spectrum-textfield-icon-inline-end-override,var(--spectrum-textfield-texticon-invalid-icon-margin-left)
)}:host([invalid]) #textfield .icon{bottom:calc(var(--spectrum-textfield-texticon-height)/2 - var(--spectrum-textfield-texticon-invalid-icon-height)/2);height:var(--spectrum-textfield-texticon-invalid-icon-height);width:var(--spectrum-textfield-texticon-invalid-icon-width)}:host([dir=ltr][quiet][invalid]) #textfield .icon{right:var(--spectrum-textfield-icon-inline-end-override,0)}:host([dir=rtl][quiet][invalid]) #textfield .icon{left:var(--spectrum-textfield-icon-inline-end-override,0)}:host([dir=ltr][valid]) #textfield .icon{right:var(
--spectrum-textfield-icon-inline-end-override,var(--spectrum-textfield-texticon-success-icon-margin-left)
)}:host([dir=rtl][valid]) #textfield .icon{left:var(
--spectrum-textfield-icon-inline-end-override,var(--spectrum-textfield-texticon-success-icon-margin-left)
)}:host([valid]) #textfield .icon{bottom:calc(var(--spectrum-textfield-texticon-height)/2 - var(--spectrum-textfield-texticon-success-icon-height)/2);height:var(--spectrum-textfield-texticon-success-icon-height);width:var(--spectrum-textfield-texticon-success-icon-width)}:host([dir=ltr][quiet][valid]) #textfield .icon{right:var(--spectrum-textfield-icon-inline-end-override,0)}:host([dir=rtl][quiet][valid]) #textfield .icon{left:var(--spectrum-textfield-icon-inline-end-override,0)}:host([dir=ltr]) .icon-workflow{left:var(--spectrum-textfield-texticon-padding-left)}:host([dir=rtl]) .icon-workflow{right:var(--spectrum-textfield-texticon-padding-left)}.icon-workflow{display:block;height:var(
--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225)
);position:absolute;top:calc(var(--spectrum-textfield-texticon-height)/2 - var(
--spectrum-alias-workflow-icon-size-m,
var(--spectrum-global-dimension-size-225)
)/2);width:var(
--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225)
)}:host([dir=ltr][quiet]) .icon-workflow{left:0}:host([dir=rtl][quiet]) .icon-workflow{right:0}:host([dir=ltr][quiet]) .icon-workflow~.input{padding-left:calc(var(
--spectrum-alias-workflow-icon-size-m,
var(--spectrum-global-dimension-size-225)
) + var(--spectrum-textfield-quiet-texticon-icon-gap))}:host([dir=rtl][quiet]) .icon-workflow~.input{padding-right:calc(var(
--spectrum-alias-workflow-icon-size-m,
var(--spectrum-global-dimension-size-225)
) + var(--spectrum-textfield-quiet-texticon-icon-gap))}:host([dir=ltr]) .icon-workflow+.input{padding-left:calc(var(--spectrum-textfield-texticon-padding-left) + var(
--spectrum-alias-workflow-icon-size-m,
var(--spectrum-global-dimension-size-225)
) + var(--spectrum-textfield-texticon-icon-gap))}:host([dir=rtl]) .icon-workflow+.input{padding-right:calc(var(--spectrum-textfield-texticon-padding-left) + var(
--spectrum-alias-workflow-icon-size-m,
var(--spectrum-global-dimension-size-225)
) + var(--spectrum-textfield-texticon-icon-gap))}:host([multiline]) .icon-workflow~.input{height:var(--spectrum-textfield-texticon-height);min-height:var(--spectrum-textfield-texticon-height)}#textfield:hover .input{border-color:var(
--spectrum-textfield-m-texticon-border-color-hover,var(--spectrum-alias-input-border-color-hover)
);box-shadow:none}#textfield:hover .input::placeholder{color:var(
--spectrum-textfield-m-texticon-placeholder-text-color-hover,var(--spectrum-alias-placeholder-text-color-hover)
)}#textfield:hover .icon-workflow{color:var(
--spectrum-textfield-m-texticon-icon-color-hover,var(--spectrum-alias-component-icon-color-hover)
)}#textfield:active .input{border-color:var(
--spectrum-textfield-m-texticon-border-color-down,var(--spectrum-alias-input-border-color-down)
)}#textfield:active .icon-workflow{color:var(
--spectrum-textfield-m-texticon-icon-color-down,var(--spectrum-alias-component-icon-color-down)
)}:host([valid]) #textfield .icon{color:var(
--spectrum-textfield-m-texticon-validation-icon-color-valid,var(--spectrum-semantic-positive-icon-color)
)}:host([invalid]) #textfield .icon{color:var(
--spectrum-textfield-m-texticon-validation-icon-color-invalid,var(--spectrum-semantic-negative-icon-color)
)}:host([invalid]) #textfield:hover .input{border-color:var(
--spectrum-textfield-m-texticon-border-color-invalid-hover,var(--spectrum-alias-input-border-color-invalid-hover)
)}:host([disabled]) #textfield .icon{color:var(
--spectrum-textfield-m-texticon-validation-icon-color-invalid-disabled,var(--spectrum-alias-background-color-transparent)
)}:host([disabled]) #textfield .icon-workflow{color:var(
--spectrum-textfield-m-texticon-icon-color-disabled,var(--spectrum-alias-component-icon-color-disabled)
)}.icon-workflow{color:var(
--spectrum-textfield-m-texticon-icon-color,var(--spectrum-alias-component-icon-color-default)
)}:host([focused]) #textfield:after{box-shadow:0 0 0 var(
--spectrum-textfield-m-texticon-focus-ring-border-width,var(--spectrum-alias-component-focusring-size)
) var(
--spectrum-textfield-m-textonly-focus-ring-border-color-key-focus,var(--spectrum-alias-focus-ring-color)
)}:host([focused][quiet]) #textfield .input{box-shadow:none}:host([focused][quiet]) #textfield:after{border-bottom:2px solid var(
--spectrum-textfield-m-textonly-focus-ring-border-color-key-focus,var(--spectrum-alias-focus-ring-color)
);bottom:calc(var(
--spectrum-alias-input-quiet-focusline-gap,
var(--spectrum-global-dimension-static-size-10)
)*-1);box-shadow:none;margin:0}.input{background-color:var(
--spectrum-textfield-m-texticon-background-color,var(--spectrum-global-color-gray-50)
);border-color:var(
--spectrum-textfield-m-texticon-border-color,var(--spectrum-alias-input-border-color-default)
);color:var(
--spectrum-textfield-m-texticon-text-color,var(--spectrum-alias-component-text-color-default)
)}.input::placeholder{color:var(
--spectrum-textfield-m-texticon-placeholder-text-color,var(--spectrum-global-color-gray-600)
)}.input:focus,:host([focused]) #textfield .input{border-color:var(
--spectrum-textfield-m-texticon-border-color-down,var(--spectrum-alias-input-border-color-down)
)}.input.focus-visible,:host([focused]) #textfield .input{border-color:var(
--spectrum-textfield-m-texticon-border-color-key-focus,var(--spectrum-alias-input-border-color-key-focus)
)}.input.focus-visible,:host([focused]) #textfield .input{border-color:var(
--spectrum-textfield-m-texticon-border-color-key-focus,var(--spectrum-alias-input-border-color-key-focus)
)}.input:focus-visible,:host([focused]) #textfield .input{border-color:var(
--spectrum-textfield-m-texticon-border-color-key-focus,var(--spectrum-alias-input-border-color-key-focus)
)}:host([invalid]) #textfield .input{border-color:var(
--spectrum-textfield-m-texticon-border-color-invalid,var(--spectrum-alias-input-border-color-invalid-default)
)}:host([focused][invalid]) #textfield .input,:host([invalid]) #textfield .input:focus{border-color:var(
--spectrum-textfield-m-texticon-border-color-invalid-mouse-focus,var(--spectrum-alias-input-border-color-invalid-mouse-focus)
)}:host([focused][invalid]) #textfield .input,:host([invalid]) #textfield .input.focus-visible{border-color:var(
--spectrum-textfield-m-texticon-border-color-invalid-key-focus,var(--spectrum-alias-input-border-color-invalid-key-focus)
)}:host([focused][invalid]) #textfield .input,:host([invalid]) #textfield .input:focus-visible{border-color:var(
--spectrum-textfield-m-texticon-border-color-invalid-key-focus,var(--spectrum-alias-input-border-color-invalid-key-focus)
)}.input:disabled,:host([disabled]) #textfield .input,:host([disabled]) #textfield:hover .input{-webkit-text-fill-color:var(
--spectrum-textfield-m-texticon-text-color-disabled,var(--spectrum-alias-component-text-color-disabled)
);background-color:var(
--spectrum-textfield-m-texticon-background-color-disabled,var(--spectrum-global-color-gray-200)
);border-color:var(
--spectrum-textfield-m-texticon-border-color-disabled,var(--spectrum-alias-input-border-color-disabled)
);color:var(
--spectrum-textfield-m-texticon-text-color-disabled,var(--spectrum-alias-component-text-color-disabled)
)}.input:disabled::placeholder,:host([disabled]) #textfield .input::placeholder,:host([disabled]) #textfield:hover .input::placeholder{color:var(
--spectrum-textfield-m-texticon-placeholder-text-color-disabled,var(--spectrum-alias-text-color-disabled)
)}.input:read-only,:host([readonly]) #textfield .input,:host([readonly]) #textfield:hover .input{-webkit-text-fill-color:var(--spectrum-global-color-gray-800);background-color:var(
--spectrum-alias-background-color-transparent,transparent
);border-color:var(
--spectrum-alias-background-color-transparent,transparent
);color:var(--spectrum-global-color-gray-800)}:host([quiet]) .input{background-color:var(
--spectrum-textfield-m-quiet-texticon-background-color,var(--spectrum-alias-background-color-transparent)
);border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color,var(--spectrum-alias-input-border-color-default)
)}:host([quiet]:hover) .input{border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-hover,var(--spectrum-alias-input-border-color-hover)
)}:host([quiet]):active .input{border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-down,var(--spectrum-alias-input-border-color-down)
)}:host([focused][quiet]) .input,:host([quiet]) .input:focus{border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-mouse-focus,var(--spectrum-alias-input-border-color-mouse-focus)
)}:host([focused][quiet]) .input,:host([quiet]) .input.focus-visible{border-color:var(
--spectrum-textfield-m-texticon-border-color-key-focus,var(--spectrum-alias-input-border-color-key-focus)
);box-shadow:0 1px 0 var(
--spectrum-textfield-m-texticon-border-color-key-focus,var(--spectrum-alias-input-border-color-key-focus)
)}:host([focused][quiet]) .input,:host([quiet]) .input:focus-visible{border-color:var(
--spectrum-textfield-m-texticon-border-color-key-focus,var(--spectrum-alias-input-border-color-key-focus)
);box-shadow:0 1px 0 var(
--spectrum-textfield-m-texticon-border-color-key-focus,var(--spectrum-alias-input-border-color-key-focus)
)}:host([invalid][quiet]) .input{border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-invalid,var(--spectrum-alias-input-border-color-invalid-default)
)}:host([focused][invalid][quiet]) .input,:host([invalid][quiet]) .input:focus{border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-invalid-mouse-focus,var(--spectrum-alias-input-border-color-invalid-mouse-focus)
)}:host([focused][invalid][quiet]) .input,:host([invalid][quiet]) .input.focus-visible{border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-invalid-key-focus,var(--spectrum-alias-input-border-color-invalid-key-focus)
);box-shadow:0 1px 0 var(
--spectrum-textfield-m-quiet-texticon-border-color-invalid-key-focus,var(--spectrum-alias-input-border-color-invalid-key-focus)
)}:host([focused][invalid][quiet]) .input,:host([invalid][quiet]) .input:focus-visible{border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-invalid-key-focus,var(--spectrum-alias-input-border-color-invalid-key-focus)
);box-shadow:0 1px 0 var(
--spectrum-textfield-m-quiet-texticon-border-color-invalid-key-focus,var(--spectrum-alias-input-border-color-invalid-key-focus)
)}:host([disabled][quiet]) .input,:host([disabled][quiet]:hover) .input,:host([quiet]) .input:disabled{background-color:var(
--spectrum-textfield-m-quiet-texticon-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-disabled,var(--spectrum-alias-input-border-color-quiet-disabled)
)}@media (forced-colors:active){:host{--spectrum-textfield-m-quiet-texticon-border-color-disabled:GrayText;--spectrum-textfield-m-quiet-texticon-border-color-down:Highlight;--spectrum-textfield-m-quiet-texticon-border-color-hover:Highlight;--spectrum-textfield-m-quiet-texticon-border-color-invalid:Highlight;--spectrum-textfield-m-quiet-texticon-border-color-invalid-key-focus:Highlight;--spectrum-textfield-m-quiet-texticon-border-color-invalid-mouse-focus:Highlight;--spectrum-textfield-m-quiet-texticon-border-color-mouse-focus:Highlight;--spectrum-textfield-m-texticon-border-color-disabled:GrayText;--spectrum-textfield-m-texticon-border-color-down:Highlight;--spectrum-textfield-m-texticon-border-color-hover:Highlight;--spectrum-textfield-m-texticon-border-color-invalid:Highlight;--spectrum-textfield-m-texticon-border-color-invalid-hover:Highlight;--spectrum-textfield-m-texticon-border-color-invalid-key-focus:Highlight;--spectrum-textfield-m-texticon-border-color-invalid-mouse-focus:Highlight;--spectrum-textfield-m-texticon-border-color-key-focus:Highlight;--spectrum-textfield-m-texticon-placeholder-text-color:GrayText;--spectrum-textfield-m-texticon-placeholder-text-color-disabled:GrayText;--spectrum-textfield-m-texticon-placeholder-text-color-hover:GrayText;--spectrum-textfield-m-texticon-text-color-disabled:GrayText;--spectrum-textfield-m-textonly-focus-ring-border-color-key-focus:Highlight;--spectrum-textfield-m-texticon-focus-ring-border-width:2px}:host([focused]) #textfield:after{forced-color-adjust:none}}:host{display:inline-flex;flex-direction:column;width:var(
--spectrum-alias-single-line-width,var(--spectrum-global-dimension-size-2400)
)}:host([multiline]){resize:both}:host([multiline][readonly]){resize:none}#textfield{width:100%}#textfield,textarea{resize:inherit}.input{min-width:var(--spectrum-textfield-texticon-min-width)}:host([focused]) .input{caret-color:var(--swc-test-caret-color);forced-color-adjust:var(--swc-test-forced-color-adjust)}:host([grows]) .input{height:100%;left:0;overflow:hidden;position:absolute;resize:none;top:0}:host([grows]) #sizer{-webkit-appearance:none;-moz-appearance:textfield;border:var(--spectrum-textfield-texticon-border-size) solid;border-radius:var(--spectrum-textfield-texticon-border-radius);box-sizing:border-box;font-family:var(--spectrum-textfield-texticon-text-font-family);font-size:var(--spectrum-textfield-texticon-text-size);line-height:var(--spectrum-textfield-texticon-text-line-height);margin:0;outline:none;overflow:visible;overflow-wrap:break-word;padding:var(--spectrum-textarea-padding-top) var(--spectrum-textarea-padding-right) var(--spectrum-textarea-padding-bottom) calc(var(--spectrum-textarea-padding-left) - 1px);text-indent:0;text-overflow:ellipsis;transition:border-color var(--spectrum-global-animation-duration-100,.13s) ease-in-out,box-shadow var(--spectrum-global-animation-duration-100,.13s) ease-in-out;vertical-align:top;white-space:pre-wrap;width:100%;word-break:break-word}:host([grows][quiet]) #sizer{border-radius:var(--spectrum-textfield-quiet-texticon-border-radius);border-width:0 0 var(--spectrum-textfield-quiet-texticon-border-size) 0;overflow-y:hidden;resize:none}.icon,.icon-workflow{pointer-events:none}:host([multiline]) #textfield{display:inline-grid}:host([multiline]) textarea{transition:box-shadow var(--spectrum-global-animation-duration-100,.13s) ease-in-out,border-color var(--spectrum-global-animation-duration-100,.13s) ease-in-out}:host([multiline][focused]:not([quiet])) textarea,:host([multiline][focused]:not([quiet]):hover) textarea{box-shadow:0 0 0 calc(var(
--spectrum-textfield-m-texticon-focus-ring-border-width,
var(--spectrum-alias-component-focusring-size)
)) var(
--spectrum-textfield-m-textonly-focus-ring-border-color-key-focus,var(--spectrum-alias-focus-ring-color)
)!important}:host([multiline]:not([quiet])) #textfield:after{box-shadow:none}:host([disabled][quiet]) #textfield .input,:host([disabled][quiet]) #textfield:hover .input,:host([quiet]) .input :disabled{background-color:var(
--spectrum-textfield-m-quiet-texticon-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);border-color:var(
--spectrum-textfield-m-quiet-texticon-border-color-disabled,var(--spectrum-alias-input-border-color-quiet-disabled)
)}
`,is=p`
.spectrum-UIIcon-Checkmark50{height:var(--spectrum-alias-ui-icon-checkmark-size-50);width:var(--spectrum-alias-ui-icon-checkmark-size-50)}.spectrum-UIIcon-Checkmark75{height:var(--spectrum-alias-ui-icon-checkmark-size-75);width:var(--spectrum-alias-ui-icon-checkmark-size-75)}.spectrum-UIIcon-Checkmark100{height:var(--spectrum-alias-ui-icon-checkmark-size-100);width:var(--spectrum-alias-ui-icon-checkmark-size-100)}.spectrum-UIIcon-Checkmark200{height:var(--spectrum-alias-ui-icon-checkmark-size-200);width:var(--spectrum-alias-ui-icon-checkmark-size-200)}.spectrum-UIIcon-Checkmark300{height:var(--spectrum-alias-ui-icon-checkmark-size-300);width:var(--spectrum-alias-ui-icon-checkmark-size-300)}.spectrum-UIIcon-Checkmark400{height:var(--spectrum-alias-ui-icon-checkmark-size-400);width:var(--spectrum-alias-ui-icon-checkmark-size-400)}.spectrum-UIIcon-Checkmark500{height:var(--spectrum-alias-ui-icon-checkmark-size-500);width:var(--spectrum-alias-ui-icon-checkmark-size-500)}.spectrum-UIIcon-Checkmark600{height:var(--spectrum-alias-ui-icon-checkmark-size-600);width:var(--spectrum-alias-ui-icon-checkmark-size-600)}
`,ns=Object.defineProperty,ls=Object.getOwnPropertyDescriptor,w=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?ls(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&ns(t,e,s),s};const us=["text","url","tel","email","password"];class z extends function(t,{mode:e}={mode:"internal"}){return class extends t{constructor(){super(...arguments),this.helpTextManager=new gr(this,{mode:e})}get helpTextId(){return this.helpTextManager.id}renderHelpText(o){return this.helpTextManager.render(o)}}}(F){constructor(){super(...arguments),this.allowedKeys="",this.focused=!1,this.invalid=!1,this.label="",this.placeholder="",this._type="text",this.grows=!1,this.maxlength=-1,this.minlength=-1,this.multiline=!1,this.readonly=!1,this.valid=!1,this._value="",this.quiet=!1,this.required=!1}static get styles(){return[cs,is]}get type(){var t;return(t=us.find(e=>e===this._type))!=null?t:"text"}set type(t){const e=this._type;this._type=t,this.requestUpdate("type",e)}set value(t){if(t===this.value)return;const e=this._value;this._value=t,this.requestUpdate("value",e)}get value(){return this._value}get focusElement(){return this.inputElement}setSelectionRange(t,e,o="none"){this.inputElement.setSelectionRange(t,e,o)}select(){this.inputElement.select()}handleInput(){if(this.allowedKeys&&this.inputElement.value&&!new RegExp(`^[${this.allowedKeys}]*$`,"u").test(this.inputElement.value)){const t=this.inputElement.selectionStart-1;return this.inputElement.value=this.value.toString(),void this.inputElement.setSelectionRange(t,t)}this.value=this.inputElement.value}handleChange(){this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))}onFocus(){this.focused=!this.readonly&&!0}onBlur(){this.focused=!this.readonly&&!1}renderStateIcons(){return this.invalid?u`
                <sp-icon-alert id="invalid" class="icon"></sp-icon-alert>
            `:this.valid?u`
                <sp-icon-checkmark100
                    id="valid"
                    class="icon spectrum-UIIcon-Checkmark100"
                ></sp-icon-checkmark100>
            `:f}get displayValue(){return this.value.toString()}get renderMultiline(){return u`
            ${this.grows&&!this.quiet?u`
                      <div id="sizer">${this.value}&#8203;</div>
                  `:f}
            <!-- @ts-ignore -->
            <textarea
                aria-describedby=${this.helpTextId}
                aria-label=${this.label||this.placeholder}
                aria-invalid=${b(this.invalid||void 0)}
                class="input"
                maxlength=${b(this.maxlength>-1?this.maxlength:void 0)}
                minlength=${b(this.minlength>-1?this.minlength:void 0)}
                pattern=${b(this.pattern)}
                placeholder=${this.placeholder}
                .value=${this.displayValue}
                @change=${this.handleChange}
                @input=${this.handleInput}
                @focus=${this.onFocus}
                @blur=${this.onBlur}
                ?disabled=${this.disabled}
                ?required=${this.required}
                ?readonly=${this.readonly}
                autocomplete=${b(this.autocomplete)}
            ></textarea>
        `}get renderInput(){return u`
            <!-- @ts-ignore -->
            <input
                type=${this.type}
                aria-describedby=${this.helpTextId}
                aria-label=${this.label||this.placeholder}
                aria-invalid=${b(this.invalid||void 0)}
                class="input"
                maxlength=${b(this.maxlength>-1?this.maxlength:void 0)}
                minlength=${b(this.minlength>-1?this.minlength:void 0)}
                pattern=${b(this.pattern)}
                placeholder=${this.placeholder}
                .value=${go(this.displayValue)}
                @change=${this.handleChange}
                @input=${this.handleInput}
                @focus=${this.onFocus}
                @blur=${this.onBlur}
                ?disabled=${this.disabled}
                ?required=${this.required}
                ?readonly=${this.readonly}
                autocomplete=${b(this.autocomplete)}
            />
        `}renderField(){return u`
            ${this.renderStateIcons()}
            ${this.multiline?this.renderMultiline:this.renderInput}
        `}render(){return u`
            <div id="textfield">${this.renderField()}</div>
            ${this.renderHelpText(this.invalid)}
        `}update(t){(t.has("value")||t.has("required")&&this.required)&&this.updateComplete.then(()=>{this.checkValidity()}),super.update(t)}checkValidity(){let t=this.inputElement.checkValidity();return(this.required||this.value&&this.pattern)&&((this.disabled||this.multiline)&&this.pattern&&(t=new RegExp(`^${this.pattern}$`,"u").test(this.value.toString())),this.minlength!==void 0&&(t=t&&this.value.toString().length>=this.minlength),this.valid=t,this.invalid=!t),t}}w([l({attribute:"allowed-keys"})],z.prototype,"allowedKeys",2),w([l({type:Boolean,reflect:!0})],z.prototype,"focused",2),w([X(".input")],z.prototype,"inputElement",2),w([l({type:Boolean,reflect:!0})],z.prototype,"invalid",2),w([l()],z.prototype,"label",2),w([l()],z.prototype,"placeholder",2),w([l({attribute:"type",reflect:!0})],z.prototype,"_type",2),w([Wt()],z.prototype,"type",1),w([l()],z.prototype,"pattern",2),w([l({type:Boolean,reflect:!0})],z.prototype,"grows",2),w([l({type:Number})],z.prototype,"maxlength",2),w([l({type:Number})],z.prototype,"minlength",2),w([l({type:Boolean,reflect:!0})],z.prototype,"multiline",2),w([l({type:Boolean,reflect:!0})],z.prototype,"readonly",2),w([l({type:Boolean,reflect:!0})],z.prototype,"valid",2),w([l({type:String})],z.prototype,"value",1),w([l({type:Boolean,reflect:!0})],z.prototype,"quiet",2),w([l({type:Boolean,reflect:!0})],z.prototype,"required",2),w([l({type:String,reflect:!0})],z.prototype,"autocomplete",2);class hr extends z{constructor(){super(...arguments),this._value=""}set value(t){if(t===this.value)return;const e=this._value;this._value=t,this.requestUpdate("value",e)}get value(){return this._value}}w([l({type:String})],hr.prototype,"value",1),customElements.define("sp-clear-button",ur),customElements.define("sp-icon-magnify",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Magnify"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M33.173 30.215 25.4 22.443a12.826 12.826 0 1 0-2.957 2.957l7.772 7.772a2.1 2.1 0 0 0 2.958-2.958ZM6 15a9 9 0 1 1 9 9 9 9 0 0 1-9-9Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}});var ms=p`
:host{--spectrum-search-quiet-button-offset:calc(var(
--spectrum-actionbutton-m-texticon-min-width,
var(--spectrum-global-dimension-size-400)
)/2 - var(--spectrum-alias-ui-icon-cross-size-100)/2)}#textfield{display:inline-block;position:relative}:host([dir=ltr]) #button{right:0}:host([dir=rtl]) #button{left:0}#button{position:absolute;top:0}.input{-webkit-appearance:none;border-radius:var(
--spectrum-alias-search-border-radius,var(--spectrum-global-dimension-size-50)
);outline-offset:-2px}.input::-webkit-search-cancel-button,.input::-webkit-search-decoration{-webkit-appearance:none}#textfield:after{border-radius:var(
--spectrum-alias-search-border-radius,var(--spectrum-global-dimension-size-50)
)}:host([dir=ltr]:not([quiet])) #textfield .icon{left:var(--spectrum-alias-search-padding-left-m)}:host([dir=rtl]:not([quiet])) #textfield .icon{right:var(--spectrum-alias-search-padding-left-m)}:host([dir=ltr]:not([quiet])) #textfield .input{padding-left:calc(var(--spectrum-alias-search-padding-left-m) + var(
--spectrum-alias-workflow-icon-size-m,
var(--spectrum-global-dimension-size-225)
) + var(
--spectrum-textfield-m-texticon-icon-gap,
var(--spectrum-global-dimension-size-100)
) - var(
--spectrum-textfield-m-texticon-border-size,
var(--spectrum-alias-input-border-size)
))}:host([dir=rtl]:not([quiet])) #textfield .input{padding-right:calc(var(--spectrum-alias-search-padding-left-m) + var(
--spectrum-alias-workflow-icon-size-m,
var(--spectrum-global-dimension-size-225)
) + var(
--spectrum-textfield-m-texticon-icon-gap,
var(--spectrum-global-dimension-size-100)
) - var(
--spectrum-textfield-m-texticon-border-size,
var(--spectrum-alias-input-border-size)
))}:host([quiet]) #button{transform:translateX(var(--spectrum-search-quiet-button-offset))}:host([quiet]) .input{border-radius:var(--spectrum-alias-search-border-radius-quiet,0)}:host([quiet]) #textfield:after{border-radius:var(--spectrum-alias-search-border-radius-quiet,0)}.icon{color:var(
--spectrum-textfield-m-texticon-icon-color,var(--spectrum-alias-component-icon-color-default)
)}.input:hover~.icon{color:var(
--spectrum-search-m-icon-color-hover,var(--spectrum-alias-component-icon-color-hover)
)}.input:active~.icon{color:var(
--spectrum-search-m-icon-color-down,var(--spectrum-alias-component-icon-color-down)
)}.input.focus-visible~.icon{color:var(
--spectrum-search-m-icon-color-key-focus,var(--spectrum-alias-component-icon-color-key-focus)
)}.input.focus-visible~.icon{color:var(
--spectrum-search-m-icon-color-key-focus,var(--spectrum-alias-component-icon-color-key-focus)
)}.input:focus-visible~.icon{color:var(
--spectrum-search-m-icon-color-key-focus,var(--spectrum-alias-component-icon-color-key-focus)
)}.input:disabled~.icon{color:var(
--spectrum-textfield-m-texticon-text-color-disabled,var(--spectrum-alias-component-text-color-disabled)
)}:host([dir=ltr]){--spectrum-textfield-texticon-padding-right:var(
--spectrum-alias-infieldbutton-full-height-m
)}:host([dir=rtl]){--spectrum-textfield-texticon-padding-left:var(
--spectrum-alias-infieldbutton-full-height-m
)}input::-webkit-search-cancel-button{display:none}
`,ps=Object.defineProperty,ds=Object.getOwnPropertyDescriptor,wt=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?ds(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&ps(t,e,s),s};const gs=r=>r.stopPropagation();class ut extends hr{constructor(){super(...arguments),this.action="",this.label="Search",this.placeholder="Search"}static get styles(){return[...super.styles,ms]}handleSubmit(t){this.dispatchEvent(new Event("submit",{cancelable:!0,bubbles:!0}))||t.preventDefault()}handleKeydown(t){const{code:e}=t;!this.value||e!=="Escape"||this.reset()}async reset(){this.value="",await this.updateComplete,this.focusElement.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0})),this.focusElement.dispatchEvent(new InputEvent("change",{bubbles:!0}))}renderField(){return u`
            <form
                action=${this.action}
                id="form"
                method=${b(this.method)}
                @submit=${this.handleSubmit}
                @reset=${this.reset}
                @keydown=${this.handleKeydown}
            >
                <sp-icon-magnify
                    class="icon magnifier icon-workflow"
                ></sp-icon-magnify>
                ${super.renderField()}
                ${this.value?u`
                          <sp-clear-button
                              id="button"
                              label="Reset"
                              tabindex="-1"
                              type="reset"
                              @keydown=${gs}
                          ></sp-clear-button>
                      `:u``}
            </form>
        `}firstUpdated(t){super.firstUpdated(t),this.inputElement.setAttribute("type","search")}willUpdate(){this.multiline=!1}}wt([l()],ut.prototype,"action",2),wt([l()],ut.prototype,"label",2),wt([l()],ut.prototype,"method",2),wt([l()],ut.prototype,"placeholder",2),wt([X("#form")],ut.prototype,"form",2),customElements.define("sp-search",ut);var bs=p`
:host{--spectrum-divider-thickness:var(--spectrum-divider-thickness-medium);--spectrum-divider-background-color:var(
--spectrum-divider-background-color-medium
);--spectrum-divider-background-color-small:var(--spectrum-gray-300);--spectrum-divider-background-color-medium:var(--spectrum-gray-300);--spectrum-divider-background-color-large:var(--spectrum-gray-800);--spectrum-divider-background-color-small-static-white:var(
--spectrum-transparent-white-300
);--spectrum-divider-background-color-medium-static-white:var(
--spectrum-transparent-white-300
);--spectrum-divider-background-color-large-static-white:var(
--spectrum-transparent-white-800
);--spectrum-divider-background-color-small-static-black:var(
--spectrum-transparent-black-300
);--spectrum-divider-background-color-medium-static-black:var(
--spectrum-transparent-black-300
);--spectrum-divider-background-color-large-static-black:var(
--spectrum-transparent-black-800
)}:host([size=s]){--spectrum-divider-thickness:var(--spectrum-divider-thickness-small);--spectrum-divider-background-color:var(
--spectrum-divider-background-color-small
)}:host([size=m]){--spectrum-divider-thickness:var(--spectrum-divider-thickness-medium);--spectrum-divider-background-color:var(
--spectrum-divider-background-color-medium
)}:host([size=l]){--spectrum-divider-thickness:var(--spectrum-divider-thickness-large);--spectrum-divider-background-color:var(
--spectrum-divider-background-color-large
)}@media (forced-colors:active){:host{--spectrum-divider-background-color:CanvasText;--spectrum-divider-background-color-small-static-white:CanvasText;--spectrum-divider-background-color-medium-static-white:CanvasText;--spectrum-divider-background-color-large-static-white:CanvasText;--spectrum-divider-background-color-small-static-black:CanvasText;--spectrum-divider-background-color-medium-static-black:CanvasText;--spectrum-divider-background-color-large-static-black:CanvasText}}:host{background-color:var(
--mod-divider-background-color,var(--spectrum-divider-background-color)
);block-size:var(--mod-divider-thickness,var(--spectrum-divider-thickness));border:none;border-radius:var(
--mod-divider-thickness,var(--spectrum-divider-thickness)
);border-width:var(
--mod-divider-thickness,var(--spectrum-divider-thickness)
);inline-size:100%;overflow:visible}:host([static=white][size=s]){--spectrum-divider-background-color:var(
--mod-divider-background-color-small-static-white,var(--spectrum-divider-background-color-small-static-white)
)}:host([static=white][size=m]){--spectrum-divider-background-color:var(
--mod-divider-background-color-medium-static-white,var(--spectrum-divider-background-color-medium-static-white)
)}:host([static=white][size=l]){--spectrum-divider-background-color:var(
--mod-divider-background-color-large-static-white,var(--spectrum-divider-background-color-large-static-white)
)}:host([static=black][size=s]){--spectrum-divider-background-color:var(
--mod-divider-background-color-small-static-black,var(--spectrum-divider-background-color-small-static-black)
)}:host([static=black][size=m]){--spectrum-divider-background-color:var(
--mod-divider-background-color-medium-static-black,var(--spectrum-divider-background-color-medium-static-black)
)}:host([static=black][size=l]){--spectrum-divider-background-color:var(
--mod-divider-background-color-large-static-black,var(--spectrum-divider-background-color-large-static-black)
)}:host([vertical]){block-size:100%;inline-size:var(
--mod-divider-thickness,var(--spectrum-divider-thickness)
)}:host{display:block}hr{border:none;margin:0}
`,hs=Object.defineProperty,vs=Object.getOwnPropertyDescriptor;class me extends R(L,{validSizes:["s","m","l"]}){constructor(){super(...arguments),this.vertical=!1}render(){return u``}firstUpdated(t){super.firstUpdated(t),this.setAttribute("role","separator")}updated(t){super.updated(t),t.has("vertical")&&(this.vertical?this.setAttribute("aria-orientation","vertical"):this.removeAttribute("aria-orientation"))}}me.styles=[bs],((r,t,e,o)=>{for(var a,s=o>1?void 0:o?vs(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);o&&s&&hs(t,e,s)})([l({type:Boolean,reflect:!0})],me.prototype,"vertical",2),customElements.define("sp-divider",me),customElements.define("sp-close-button",mr),customElements.define("sp-icon-info",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Info"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2Zm-.3 4.3a2.718 2.718 0 0 1 2.864 2.824 2.664 2.664 0 0 1-2.864 2.863 2.705 2.705 0 0 1-2.864-2.864A2.717 2.717 0 0 1 17.7 6.3ZM22 27a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-6h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v9h1a1 1 0 0 1 1 1Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}}),customElements.define("sp-icon-checkmark-circle",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Checkmark Circle"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${r}
    height=${t}
    viewBox="0 0 36 36"
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2Zm10.666 9.08L16.018 27.341a1.208 1.208 0 0 1-.875.461c-.024.002-.05.002-.073.002a1.2 1.2 0 0 1-.85-.351l-7.784-7.795a1.2 1.2 0 0 1 0-1.698l1.326-1.325a1.201 1.201 0 0 1 1.695 0l5.346 5.347L25.314 8.473A1.203 1.203 0 0 1 27 8.263l1.455 1.133a1.205 1.205 0 0 1 .211 1.684Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}});var fs=p`
:host{--spectrum-toast-font-weight:var(--spectrum-font-weight-regular);--spectrum-toast-font-size:var(--spectrum-font-size-100);--spectrum-toast-corner-radius:var(--spectrum-corner-radius-100);--spectrum-toast-block-size:var(--spectrum-toast-height);--spectrum-toast-border-width:var(--spectrum-border-width-100);--spectrum-toast-line-height:var(--spectrum-line-height-100);--spectrum-toast-line-height-cjk:var(--spectrum-line-height-cjk-100);--spectrum-toast-spacing-icon-to-text:var(--spectrum-text-to-visual-100);--spectrum-toast-spacing-start-edge-to-text-and-icon:var(
--spectrum-spacing-300
);--spectrum-toast-spacing-text-and-action-button-to-divider:var(
--spectrum-spacing-300
);--spectrum-toast-spacing-top-edge-to-divider:var(--spectrum-spacing-100);--spectrum-toast-spacing-bottom-edge-to-divider:var(
--spectrum-spacing-100
);--spectrum-toast-spacing-top-edge-to-icon:var(
--spectrum-toast-top-to-workflow-icon
);--spectrum-toast-spacing-text-to-action-button-horizontal:var(
--spectrum-spacing-300
);--spectrum-toast-spacing-close-button:var(--spectrum-spacing-100);--spectrum-toast-spacing-block-start:var(--spectrum-spacing-100);--spectrum-toast-spacing-block-end:var(--spectrum-spacing-100);--spectrum-toast-spacing-top-edge-to-text:var(
--spectrum-toast-top-to-text
);--spectrum-toast-spacing-bottom-edge-to-text:var(
--spectrum-toast-bottom-to-text
);--spectrum-toast-negative-background-color-default:var(
--spectrum-negative-background-color-default
);--spectrum-toast-positive-background-color-default:var(
--spectrum-positive-background-color-default
);--spectrum-toast-informative-background-color-default:var(
--spectrum-informative-background-color-default
);--spectrum-toast-text-and-icon-color:var(--spectrum-white);--spectrum-toast-divider-color:var(--spectrum-transparent-white-300)}@media (forced-colors:active){:host{--highcontrast-toast-border-color:ButtonText;border:var(
--mod-toast-border-width,var(--spectrum-toast-border-width)
) solid var(--highcontrast-toast-border-color,transparent)}}:host{-webkit-font-smoothing:antialiased;align-items:stretch;background-color:var(
--highcontrast-toast-background-color-default,var(
--mod-toast-background-color-default,var(--spectrum-toast-background-color-default)
)
);border-radius:var(
--mod-toast-corner-radius,var(--spectrum-toast-corner-radius)
);box-sizing:border-box;color:var(
--highcontrast-toast-background-color-default,var(
--mod-toast-background-color-default,var(--spectrum-toast-background-color-default)
)
);display:inline-flex;flex-direction:row;font-size:var(--mod-toast-font-size,var(--spectrum-toast-font-size));font-weight:var(
--mod-toast-font-weight,var(--spectrum-toast-font-weight)
);min-block-size:var(--spectrum-toast-block-size);padding-inline-start:var(
--mod-toast-spacing-start-edge-to-text-and-icon,var(--spectrum-toast-spacing-start-edge-to-text-and-icon)
)}:host([variant=negative]){background-color:var(
--highcontrast-toast-negative-background-color-default,var(
--mod-toast-negative-background-color-default,var(--spectrum-toast-negative-background-color-default)
)
);color:var(
--highcontrast-toast-negative-background-color-default,var(
--mod-toast-negative-background-color-default,var(--spectrum-toast-negative-background-color-default)
)
)}:host([variant=negative]) .closeButton.focus-visible:not(:active){color:var(
--highcontrast-toast-negative-background-color-default,var(
--mod-toast-negative-background-color-default,var(--spectrum-toast-negative-background-color-default)
)
)}:host([variant=negative]) .closeButton.focus-visible:not(:active){color:var(
--highcontrast-toast-negative-background-color-default,var(
--mod-toast-negative-background-color-default,var(--spectrum-toast-negative-background-color-default)
)
)}:host([variant=negative]) .closeButton:focus-visible:not(:active){color:var(
--highcontrast-toast-negative-background-color-default,var(
--mod-toast-negative-background-color-default,var(--spectrum-toast-negative-background-color-default)
)
)}:host([variant=info]){background-color:var(
--highcontrast-toast-informative-background-color-default,var(
--mod-toast-informative-background-color-default,var(--spectrum-toast-informative-background-color-default)
)
);color:var(
--highcontrast-toast-informative-background-color-default,var(
--mod-toast-informative-background-color-default,var(--spectrum-toast-informative-background-color-default)
)
)}:host([variant=info]) .closeButton.focus-visible:not(:active){color:var(
--highcontrast-toast-informative-background-color-default,var(
--mod-toast-informative-background-color-default,var(--spectrum-toast-informative-background-color-default)
)
)}:host([variant=info]) .closeButton.focus-visible:not(:active){color:var(
--highcontrast-toast-informative-background-color-default,var(
--mod-toast-informative-background-color-default,var(--spectrum-toast-informative-background-color-default)
)
)}:host([variant=info]) .closeButton:focus-visible:not(:active){color:var(
--highcontrast-toast-informative-background-color-default,var(
--mod-toast-informative-background-color-default,var(--spectrum-toast-informative-background-color-default)
)
)}:host([variant=positive]){background-color:var(
--highcontrast-toast-positive-background-color-default,var(
--mod-toast-positive-background-color-default,var(--spectrum-toast-positive-background-color-default)
)
);color:var(
--highcontrast-toast-positive-background-color-default,var(
--mod-toast-positive-background-color-default,var(--spectrum-toast-positive-background-color-default)
)
)}:host([variant=positive]) .closeButton.focus-visible:not(:active){color:var(
--highcontrast-toast-positive-background-color-default,var(
--mod-toast-positive-background-color-default,var(--spectrum-toast-positive-background-color-default)
)
)}:host([variant=positive]) .closeButton.focus-visible:not(:active){color:var(
--highcontrast-toast-positive-background-color-default,var(
--mod-toast-positive-background-color-default,var(--spectrum-toast-positive-background-color-default)
)
)}:host([variant=positive]) .closeButton:focus-visible:not(:active){color:var(
--highcontrast-toast-positive-background-color-default,var(
--mod-toast-positive-background-color-default,var(--spectrum-toast-positive-background-color-default)
)
)}.type{flex-grow:0;flex-shrink:0;margin-block-start:var(
--mod-toast-spacing-top-edge-to-icon,var(--spectrum-toast-spacing-top-edge-to-icon)
);margin-inline-end:var(
--mod-toast-spacing-icon-to-text,var(--spectrum-toast-spacing-icon-to-text)
);margin-inline-start:0}.content,.type{color:var(
--highcontrast-toast-text-and-icon-color,var(
--mod-toast-text-and-icon-color,var(--spectrum-toast-text-and-icon-color)
)
)}.content{box-sizing:border-box;display:inline-block;flex:auto;line-height:var(
--mod-toast-line-height,var(--spectrum-toast-line-height)
);padding-block-end:calc(var(
--mod-toast-spacing-bottom-edge-to-text,
var(--spectrum-toast-spacing-bottom-edge-to-text)
) - var(
--mod-toast-spacing-block-end,
var(--spectrum-toast-spacing-block-end)
));padding-block-start:calc(var(
--mod-toast-spacing-top-edge-to-text,
var(--spectrum-toast-spacing-top-edge-to-text)
) - var(
--mod-toast-spacing-block-start,
var(--spectrum-toast-spacing-block-start)
));padding-inline-end:var(
--mod-toast-spacing-text-to-action-button-horizontal,var(--spectrum-toast-spacing-text-to-action-button-horizontal)
);padding-inline-start:0;text-align:start}.content:lang(ja),.content:lang(ko),.content:lang(zh){line-height:var(
--mod-toast-line-height-cjk,var(--spectrum-toast-line-height-cjk)
)}.buttons{align-items:flex-start;border-inline-start-color:var(
--mod-toast-divider-color,var(--spectrum-toast-divider-color)
);display:flex;flex:none;margin-block-end:var(
--mod-toast-spacing-bottom-edge-to-divider,var(--spectrum-toast-spacing-bottom-edge-to-divider)
);margin-block-start:var(
--mod-toast-spacing-top-edge-to-divider,var(--spectrum-toast-spacing-top-edge-to-divider)
);padding-inline-end:var(
--mod-toast-spacing-close-button,var(--spectrum-toast-spacing-close-button)
)}.buttons .spectrum-CloseButton{align-self:flex-start}.body{align-items:center;align-self:center;display:flex;flex:auto;flex-wrap:wrap;padding-block-end:var(
--mod-toast-spacing-block-end,var(--spectrum-toast-spacing-block-end)
);padding-block-start:var(
--mod-toast-spacing-block-start,var(--spectrum-toast-spacing-block-start)
)}.body ::slotted([slot=action]){margin-inline-end:var(
--mod-toast-spacing-text-and-action-button-to-divider,var(--spectrum-toast-spacing-text-and-action-button-to-divider)
)}:host([dir=ltr]) .body ::slotted([slot=action]){margin-left:auto}:host([dir=rtl]) .body ::slotted([slot=action]){margin-right:auto;margin-inline-end:var(
--mod-toast-spacing-text-and-action-button-to-divider,var(--spectrum-toast-spacing-text-and-action-button-to-divider)
)}.body+.buttons{border-inline-start-style:solid;border-inline-start-width:1px;padding-inline-start:var(
--mod-toast-spacing-close-button,var(--spectrum-toast-spacing-close-button)
)}:host{--spectrum-toast-background-color-default:var(
--system-spectrum-toast-background-color-default
)}:host(:not([open])){display:none}
`,ys=Object.defineProperty,xs=Object.getOwnPropertyDescriptor,pe=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?xs(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&ys(t,e,s),s};const ks=["negative","positive","info","error","warning"];class jt extends L{constructor(){super(...arguments),this.open=!1,this._timeout=null,this._variant="",this.countdownStart=0,this.nextCount=-1,this.doCountdown=t=>{this.countdownStart||(this.countdownStart=performance.now()),t-this.countdownStart>this._timeout?(this.shouldClose(),this.countdownStart=0):this.countdown()},this.countdown=()=>{cancelAnimationFrame(this.nextCount),this.nextCount=requestAnimationFrame(this.doCountdown)},this.holdCountdown=()=>{this.stopCountdown(),this.addEventListener("focusout",this.resumeCountdown)},this.resumeCountdown=()=>{this.removeEventListener("focusout",this.holdCountdown),this.countdown()}}static get styles(){return[fs]}set timeout(t){const e=typeof t!==null&&t>0?Math.max(6e3,t):null,o=this.timeout;e&&this.countdownStart&&(this.countdownStart=performance.now()),this._timeout=e,this.requestUpdate("timeout",o)}get timeout(){return this._timeout}set variant(t){if(t===this.variant)return;const e=this.variant;ks.includes(t)?(this.setAttribute("variant",t),this._variant=t):(this.removeAttribute("variant"),this._variant=""),this.requestUpdate("variant",e)}get variant(){return this._variant}renderIcon(t){switch(t){case"info":return u`
                    <sp-icon-info
                        label="Information"
                        class="type"
                    ></sp-icon-info>
                `;case"negative":case"error":case"warning":return u`
                    <sp-icon-alert label="Error" class="type"></sp-icon-alert>
                `;case"positive":case"success":return u`
                    <sp-icon-checkmark-circle
                        label="Success"
                        class="type"
                    ></sp-icon-checkmark-circle>
                `;default:return u``}}startCountdown(){this.countdown(),this.addEventListener("focusin",this.holdCountdown)}stopCountdown(){cancelAnimationFrame(this.nextCount),this.countdownStart=0}shouldClose(){this.dispatchEvent(new CustomEvent("close",{composed:!0,bubbles:!0,cancelable:!0}))&&this.close()}close(){this.open=!1}render(){return u`
            ${this.renderIcon(this.variant)}
            <div class="body" role="alert">
                <div class="content">
                    <slot></slot>
                </div>
                <slot name="action"></slot>
            </div>
            <div class="buttons">
                <sp-close-button
                    @click=${this.shouldClose}
                    label="Close"
                    variant="white"
                ></sp-close-button>
            </div>
        `}updated(t){super.updated(t),t.has("open")&&(this.open?this.timeout&&this.startCountdown():this.timeout&&this.stopCountdown()),t.has("timeout")&&(this.timeout!==null&&this.open?this.startCountdown():this.stopCountdown())}}pe([l({type:Boolean,reflect:!0})],jt.prototype,"open",2),pe([l({type:Number})],jt.prototype,"timeout",1),pe([l({type:String})],jt.prototype,"variant",1),customElements.define("sp-toast",jt);const de=async(r,t,e,o)=>{const{Overlay:a}=await import("./overlay.js");return a.open(r,t,e,o)};var ws=p`
:host{--spectrum-overlay-animation-distance:6px;--spectrum-overlay-animation-duration:var(
--spectrum-animation-duration-100
);opacity:0;pointer-events:none;transition:transform var(--spectrum-overlay-animation-duration) ease-in-out,opacity var(--spectrum-overlay-animation-duration) ease-in-out,visibility 0s linear var(--spectrum-overlay-animation-duration);visibility:hidden}:host([open]){opacity:1;pointer-events:auto;transition-delay:0s;visibility:visible}:host([open]) .spectrum-Tooltip--bottom-end,:host([open]) .spectrum-Tooltip--bottom-left,:host([open]) .spectrum-Tooltip--bottom-right,:host([open]) .spectrum-Tooltip--bottom-start,:host([placement*=bottom][open]){--spectrum-overlay-animation-distance:6px;transform:translateY(var(--spectrum-overlay-animation-distance))}:host([open]),:host([open]) .spectrum-Tooltip--top-end,:host([open]) .spectrum-Tooltip--top-left,:host([open]) .spectrum-Tooltip--top-right,:host([open]) .spectrum-Tooltip--top-start,:host([placement*=top][open]){--spectrum-overlay-animation-distance:6px;transform:translateY(calc(var(--spectrum-overlay-animation-distance)*-1))}:host([dir=rtl][open]) .spectrum-Tooltip--start,:host([dir=rtl][open]) .spectrum-Tooltip--start-bottom,:host([dir=rtl][open]) .spectrum-Tooltip--start-top,:host([open]) .spectrum-Tooltip--end,:host([open]) .spectrum-Tooltip--end-bottom,:host([open]) .spectrum-Tooltip--end-top,:host([open]) .spectrum-Tooltip--right-bottom,:host([open]) .spectrum-Tooltip--right-top,:host([placement*=right][open]){--spectrum-overlay-animation-distance:6px;transform:translateX(var(--spectrum-overlay-animation-distance))}:host([dir=rtl][open]) .spectrum-Tooltip--end,:host([dir=rtl][open]) .spectrum-Tooltip--end-bottom,:host([dir=rtl][open]) .spectrum-Tooltip--end-top,:host([open]) .spectrum-Tooltip--left-bottom,:host([open]) .spectrum-Tooltip--left-top,:host([open]) .spectrum-Tooltip--start,:host([open]) .spectrum-Tooltip--start-bottom,:host([open]) .spectrum-Tooltip--start-top,:host([placement*=left][open]){--spectrum-overlay-animation-distance:6px;transform:translateX(calc(var(--spectrum-overlay-animation-distance)*-1))}:host{--spectrum-tooltip-animation-duration:var(
--spectrum-animation-duration-100
);--spectrum-tooltip-animation-distance:var(--spectrum-spacing-75);--spectrum-tooltip-margin:0px;--spectrum-tooltip-height:var(--spectrum-component-height-75);--spectrum-tooltip-max-inline-size:var(--spectrum-tooltip-maximum-width);--spectrum-tooltip-border-radius:var(--spectrum-corner-radius-100);--spectrum-tooltip-icon-width:var(--spectrum-workflow-icon-size-50);--spectrum-tooltip-icon-height:var(--spectrum-workflow-icon-size-50);--spectrum-tooltip-font-size:var(--spectrum-font-size-75);--spectrum-tooltip-line-height:var(--spectrum-line-height-100);--spectrum-tooltip-cjk-line-height:var(--spectrum-line-height-cjk-100);--spectrum-tooltip-font-weight:var(--spectrum-font-weight-regular);--spectrum-tooltip-spacing-inline:var(
--spectrum-component-edge-to-text-75
);--spectrum-tooltip-spacing-block-start:var(
--spectrum-component-top-to-text-75
);--spectrum-tooltip-spacing-block-end:var(
--spectrum-component-bottom-to-text-75
);--spectrum-tooltip-icon-spacing-inline-start:var(
--spectrum-text-to-visual-75
);--spectrum-tooltip-icon-spacing-inline-end:var(
--spectrum-text-to-visual-75
);--spectrum-tooltip-icon-spacing-block-start:var(
--spectrum-component-top-to-workflow-icon-75
);--spectrum-tooltip-background-color-informative:var(
--spectrum-informative-background-color-default
);--spectrum-tooltip-background-color-positive:var(
--spectrum-positive-background-color-default
);--spectrum-tooltip-background-color-negative:var(
--spectrum-negative-background-color-default
);--spectrum-tooltip-content-color:var(--spectrum-white);--spectrum-tooltip-tip-inline-size:var(--spectrum-tooltip-tip-width);--spectrum-tooltip-tip-block-size:var(--spectrum-tooltip-tip-height);--spectrum-tooltip-pointer-corner-spacing:var(
--spectrum-corner-radius-100
);--spectrum-tooltip-background-color-default:var(
--spectrum-tooltip-backgound-color-default-neutral
)}@media (forced-colors:active){:host{border:1px solid #0000}#tip{--highcontrast-tooltip-background-color-default:CanvasText;--highcontrast-tooltip-background-color-informative:CanvasText;--highcontrast-tooltip-background-color-positive:CanvasText;--highcontrast-tooltip-background-color-negative:CanvasText;forced-color-adjust:none}}:host{-webkit-font-smoothing:antialiased;align-items:center;background-color:var(
--highcontrast-tooltip-background-color-default,var(
--mod-tooltip-background-color-default,var(--spectrum-tooltip-background-color-default)
)
);block-size:auto;border-radius:var(
--mod-tooltip-border-radius,var(--spectrum-tooltip-border-radius)
);box-sizing:border-box;color:var(
--mod-tooltip-content-color,var(--spectrum-tooltip-content-color)
);display:inline-flex;flex-direction:row;font-size:var(--mod-tooltip-font-size,var(--spectrum-tooltip-font-size));font-weight:var(
--mod-tooltip-font-weight,var(--spectrum-tooltip-font-weight)
);line-height:var(
--mod-tooltip-line-height,var(--spectrum-tooltip-line-height)
);max-inline-size:var(
--mod-tooltip-max-inline-size,var(--spectrum-tooltip-max-inline-size)
);min-block-size:var(--mod-tooltip-height,var(--spectrum-tooltip-height));padding-inline:var(
--mod-tooltip-spacing-inline,var(--spectrum-tooltip-spacing-inline)
);position:relative;vertical-align:top;width:auto;word-break:break-word}:host(:lang(ja)),:host(:lang(ko)),:host(:lang(zh)){line-height:var(
--mod-tooltip-cjk-line-height,var(--spectrum-tooltip-cjk-line-height)
)}:host{cursor:default;-webkit-user-select:none;user-select:none}p{margin:0}:host([variant=info]){background-color:var(
--highcontrast-tooltip-background-color-informative,var(
--mod-tooltip-background-color-informative,var(--spectrum-tooltip-background-color-informative)
)
)}:host([variant=positive]){background-color:var(
--highcontrast-tooltip-background-color-positive,var(
--mod-tooltip-background-color-positive,var(--spectrum-tooltip-background-color-positive)
)
)}:host([variant=negative]){background-color:var(
--highcontrast-tooltip-background-color-negative,var(
--mod-tooltip-background-color-negative,var(--spectrum-tooltip-background-color-negative)
)
)}#tip{background-color:var(
--highcontrast-tooltip-background-color-default,var(
--mod-tooltip-background-color-default,var(--spectrum-tooltip-background-color-default)
)
);clip-path:polygon(0 -5%,50% 100%,100% -5%);height:var(
--mod-tooltip-tip-block-size,var(--spectrum-tooltip-tip-block-size)
);left:50%;position:absolute;top:100%;transform:translateX(-50%);width:var(
--mod-tooltip-tip-inline-size,var(--spectrum-tooltip-tip-inline-size)
)}:host([variant=info]) #tip{background-color:var(
--highcontrast-tooltip-background-color-informative,var(
--mod-tooltip-background-color-informative,var(--spectrum-tooltip-background-color-informative)
)
)}:host([variant=positive]) #tip{background-color:var(
--highcontrast-tooltip-background-color-positive,var(
--mod-tooltip-background-color-positive,var(--spectrum-tooltip-background-color-positive)
)
)}:host([variant=negative]) #tip{background-color:var(
--highcontrast-tooltip-background-color-negative,var(
--mod-tooltip-background-color-negative,var(--spectrum-tooltip-background-color-negative)
)
)}.spectrum-Tooltip--top-end #tip,.spectrum-Tooltip--top-left #tip,.spectrum-Tooltip--top-right #tip,.spectrum-Tooltip--top-start #tip,:host([placement*=top]) #tip{top:100%}.spectrum-Tooltip--bottom-end #tip,.spectrum-Tooltip--bottom-left #tip,.spectrum-Tooltip--bottom-right #tip,.spectrum-Tooltip--bottom-start #tip,:host([placement*=bottom]) #tip{bottom:100%;clip-path:polygon(50% 0,0 105%,100% 105%);top:auto}.spectrum-Tooltip--bottom-end #tip,.spectrum-Tooltip--bottom-left #tip,.spectrum-Tooltip--bottom-right #tip,.spectrum-Tooltip--bottom-start #tip,.spectrum-Tooltip--top-end #tip,.spectrum-Tooltip--top-left #tip,.spectrum-Tooltip--top-right #tip,.spectrum-Tooltip--top-start #tip{transform:none}.spectrum-Tooltip--bottom-left #tip,.spectrum-Tooltip--top-left #tip{left:var(
--mod-tooltip-pointer-corner-spacing,var(--spectrum-tooltip-pointer-corner-spacing)
)}.spectrum-Tooltip--bottom-right #tip,.spectrum-Tooltip--top-right #tip{left:auto;right:var(
--mod-tooltip-pointer-corner-spacing,var(--spectrum-tooltip-pointer-corner-spacing)
)}.spectrum-Tooltip--bottom-start #tip,.spectrum-Tooltip--top-start #tip{left:var(
--mod-tooltip-pointer-corner-spacing,var(--spectrum-tooltip-pointer-corner-spacing)
);right:auto}:host([dir=rtl]) .spectrum-Tooltip--bottom-start #tip,:host([dir=rtl]) .spectrum-Tooltip--top-start #tip{left:auto;right:var(
--mod-tooltip-pointer-corner-spacing,var(--spectrum-tooltip-pointer-corner-spacing)
)}.spectrum-Tooltip--bottom-end #tip,.spectrum-Tooltip--top-end #tip{left:auto;right:var(
--mod-tooltip-pointer-corner-spacing,var(--spectrum-tooltip-pointer-corner-spacing)
)}:host([dir=rtl]) .spectrum-Tooltip--bottom-end #tip,:host([dir=rtl]) .spectrum-Tooltip--top-end #tip{left:var(
--mod-tooltip-pointer-corner-spacing,var(--spectrum-tooltip-pointer-corner-spacing)
);right:auto}.spectrum-Tooltip--end #tip,.spectrum-Tooltip--end-bottom #tip,.spectrum-Tooltip--end-top #tip,.spectrum-Tooltip--left-bottom #tip,.spectrum-Tooltip--left-top #tip,.spectrum-Tooltip--right-bottom #tip,.spectrum-Tooltip--right-top #tip,.spectrum-Tooltip--start #tip,.spectrum-Tooltip--start-bottom #tip,.spectrum-Tooltip--start-top #tip,:host([placement*=left]) #tip,:host([placement*=right]) #tip{height:var(
--mod-tooltip-tip-inline-size,var(--spectrum-tooltip-tip-inline-size)
);top:50%;transform:translateY(-50%);width:var(
--mod-tooltip-tip-block-size,var(--spectrum-tooltip-tip-block-size)
)}.spectrum-Tooltip--end-bottom #tip,.spectrum-Tooltip--end-top #tip,.spectrum-Tooltip--left-bottom #tip,.spectrum-Tooltip--left-top #tip,.spectrum-Tooltip--right-bottom #tip,.spectrum-Tooltip--right-top #tip,.spectrum-Tooltip--start-bottom #tip,.spectrum-Tooltip--start-top #tip{top:auto;transform:none}.spectrum-Tooltip--end #tip,.spectrum-Tooltip--end-bottom #tip,.spectrum-Tooltip--end-top #tip,.spectrum-Tooltip--right-bottom #tip,.spectrum-Tooltip--right-top #tip,:host([placement*=right]) #tip{clip-path:polygon(0 50%,105% 100%,105% 0);left:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
)*-1);right:100%}.spectrum-Tooltip--left-bottom #tip,.spectrum-Tooltip--left-top #tip,.spectrum-Tooltip--start #tip,.spectrum-Tooltip--start-bottom #tip,.spectrum-Tooltip--start-top #tip,:host([placement*=left]) #tip{clip-path:polygon(-5% 0,-5% 100%,100% 50%);left:100%}.spectrum-Tooltip--end-top #tip,.spectrum-Tooltip--left-top #tip,.spectrum-Tooltip--right-top #tip,.spectrum-Tooltip--start-top #tip{top:var(
--mod-tooltip-pointer-corner-spacing,var(--spectrum-tooltip-pointer-corner-spacing)
)}.spectrum-Tooltip--end-bottom #tip,.spectrum-Tooltip--left-bottom #tip,.spectrum-Tooltip--right-bottom #tip,.spectrum-Tooltip--start-bottom #tip{bottom:var(
--mod-tooltip-pointer-corner-spacing,var(--spectrum-tooltip-pointer-corner-spacing)
)}:host([dir=rtl]) .spectrum-Tooltip--end #tip,:host([dir=rtl]) .spectrum-Tooltip--end-bottom #tip,:host([dir=rtl]) .spectrum-Tooltip--end-top #tip{clip-path:polygon(-5% 0,-5% 100%,100% 50%);left:100%;right:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
)*-1)}:host([dir=rtl]) .spectrum-Tooltip--start #tip,:host([dir=rtl]) .spectrum-Tooltip--start-bottom #tip,:host([dir=rtl]) .spectrum-Tooltip--start-top #tip{clip-path:polygon(0 50%,105% 100%,105% 0);left:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
)*-1);right:100%}::slotted([slot=icon]){align-self:flex-start;flex-shrink:0;height:var(--mod-tooltip-icon-height,var(--spectrum-tooltip-icon-height));margin-block-start:var(
--mod-tooltip-icon-spacing-block-start,var(--spectrum-tooltip-icon-spacing-block-start)
);margin-inline-end:var(
--mod-tooltip-icon-spacing-inline-end,var(--spectrum-tooltip-icon-spacing-inline-end)
);margin-inline-start:calc(var(
--mod-tooltip-icon-spacing-inline-start,
var(--spectrum-tooltip-icon-spacing-inline-start)
) - var(
--mod-tooltip-spacing-inline,
var(--spectrum-tooltip-spacing-inline)
));width:var(--mod-tooltip-icon-width,var(--spectrum-tooltip-icon-width))}#label{line-height:var(
--mod-tooltip-line-height,var(--spectrum-tooltip-line-height)
);margin-block-end:var(
--mod-tooltip-spacing-block-end,var(--spectrum-tooltip-spacing-block-end)
);margin-block-start:var(
--mod-tooltip-spacing-block-start,var(--spectrum-tooltip-spacing-block-start)
)}.spectrum-Tooltip--top-end,.spectrum-Tooltip--top-left,.spectrum-Tooltip--top-right,.spectrum-Tooltip--top-start,:host,:host([placement*=top]){margin-bottom:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
) + var(--mod-tooltip-margin, var(--spectrum-tooltip-margin)))}.spectrum-Tooltip--bottom-end,.spectrum-Tooltip--bottom-left,.spectrum-Tooltip--bottom-right,.spectrum-Tooltip--bottom-start,:host([placement*=bottom]){margin-top:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
) + var(--mod-tooltip-margin, var(--spectrum-tooltip-margin)))}.spectrum-Tooltip--right-bottom,.spectrum-Tooltip--right-top,:host([placement*=right]){margin-left:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
) + var(--mod-tooltip-margin, var(--spectrum-tooltip-margin)))}.spectrum-Tooltip--left-bottom,.spectrum-Tooltip--left-top,:host([placement*=left]){margin-right:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
) + var(--mod-tooltip-margin, var(--spectrum-tooltip-margin)))}.spectrum-Tooltip--start,.spectrum-Tooltip--start-bottom,.spectrum-Tooltip--start-top{margin-inline-end:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
) + var(--mod-tooltip-margin, var(--spectrum-tooltip-margin)))}.spectrum-Tooltip--end,.spectrum-Tooltip--end-bottom,.spectrum-Tooltip--end-top{margin-inline-start:calc(var(
--mod-tooltip-tip-block-size,
var(--spectrum-tooltip-tip-block-size)
) + var(--mod-tooltip-margin, var(--spectrum-tooltip-margin)))}:host{--spectrum-tooltip-backgound-color-default-neutral:var(
--system-spectrum-tooltip-backgound-color-default-neutral
)}:host([placement]) #tip[style]{transform:none}
`,zs=Object.defineProperty,Cs=Object.getOwnPropertyDescriptor,mt=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?Cs(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&zs(t,e,s),s};class Is extends HTMLElement{disconnectedCallback(){this.dispatchEvent(new Event("disconnected"))}}customElements.define("tooltip-proxy",Is);const vr=class extends L{constructor(){super(),this._tooltipId="sp-tooltip-describedby-helper-"+vr.instanceCount++,this.selfManaged=!1,this.offset=6,this.hadTooltipId=!1,this.open=!1,this.placement="top",this._variant="",this.abortOverlay=()=>{},this.openOverlay=()=>{const r=this.parentElement,t=new Promise(e=>{this.abortOverlay=e});this.closeOverlayCallback=de(r,"hover",this,{abortPromise:t,offset:this.offset,placement:this.placement})},this.closeOverlay=async r=>{r&&r.type==="pointerleave"&&r.relatedTarget===this?this.addEventListener("pointerleave",t=>{t.relatedTarget!==this.parentElement&&this.closeOverlay(t)},{once:!0}):(this.abortOverlay&&this.abortOverlay(!0),this.closeOverlayCallback&&((await this.closeOverlayCallback)(),delete this.closeOverlayCallback))},this.addEventListener("sp-overlay-query",this.onOverlayQuery)}static get styles(){return[ws]}get variant(){return this._variant}set variant(r){if(r!==this.variant){if(["info","positive","negative"].includes(r))return this.setAttribute("variant",r),void(this._variant=r);this.removeAttribute("variant"),this._variant=""}}onOverlayQuery(r){!r.target||r.target!==this||(r.detail.overlayContentTipElement=this.tipElement)}generateProxy(){this._proxy||(this._proxy=document.createElement("tooltip-proxy"),this._proxy.id=this._tooltipId,this._proxy.hidden=!0,this._proxy.slot="hidden-tooltip-content",this._proxy.setAttribute("role","tooltip"),this._proxy.addEventListener("disconnected",this.closeOverlay))}overlayWillOpenCallback({trigger:r}){this.setAttribute("aria-hidden","true"),this.generateProxy(),this._proxy.textContent=this.textContent;const t=r.getAttribute("aria-describedby")||"";this.hadTooltipId=t.search(this._tooltipId)>-1,this.insertAdjacentElement("beforebegin",this._proxy),!this.hadTooltipId&&(t?r.setAttribute("aria-describedby",`${t} ${this._tooltipId}`):r.setAttribute("aria-describedby",`${this._tooltipId}`))}overlayOpenCancelledCallback({trigger:r}){this.overlayCloseCallback({trigger:r})}overlayCloseCallback({trigger:r}){let t=(r.getAttribute("aria-describedby")||"").split(/\s+/);this.hadTooltipId||(t=t.filter(e=>e!==this._tooltipId)),t.length?r.setAttribute("aria-describedby",t.join(" ")):r.removeAttribute("aria-describedby"),this.removeAttribute("aria-hidden"),this.removeProxy()}removeProxy(){this._proxy.remove()}manageTooltip(){const r=this.parentElement;this.selfManaged?(this.slot&&(this.previousSlot=this.slot),this.slot="self-managed-tooltip",r.addEventListener("pointerenter",this.openOverlay),r.addEventListener("focusin",this.openOverlay),r.addEventListener("pointerleave",this.closeOverlay),r.addEventListener("focusout",this.closeOverlay)):(this.previousSlot?this.slot=this.previousSlot:this.slot==="self-managed-tooltip"&&this.removeAttribute("slot"),r.removeEventListener("pointerenter",this.openOverlay),r.removeEventListener("focusin",this.openOverlay),r.removeEventListener("pointerleave",this.closeOverlay),r.removeEventListener("focusout",this.closeOverlay))}render(){return u`
            <slot name="icon"></slot>
            <span id="label"><slot></slot></span>
            <span id="tip"></span>
        `}async update(r){r.has("open")&&this.selfManaged&&(this.open?this.openOverlay():this.closeOverlay()),this.generateProxy(),super.update(r)}updated(r){super.updated(r),r.has("selfManaged")&&this.manageTooltip()}};let V=vr;V.instanceCount=0,mt([l({type:Boolean,attribute:"self-managed"})],V.prototype,"selfManaged",2),mt([l({type:Number,reflect:!0})],V.prototype,"offset",2),mt([l({type:Boolean,reflect:!0})],V.prototype,"open",2),mt([l({reflect:!0})],V.prototype,"placement",2),mt([X("#tip")],V.prototype,"tipElement",2),mt([l({type:String})],V.prototype,"variant",1),customElements.define("sp-tooltip",V);var Es=p`
:host([disabled]) ::slotted([slot=trigger]){pointer-events:none}#overlay-content slot{display:none}
`,Ls=Object.defineProperty,As=Object.getOwnPropertyDescriptor,pt=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?As(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&Ls(t,e,s),s};const Ss={touch:"Double tap and long press for additional options",keyboard:"Press Space or Alt+Down Arrow for additional options",mouse:"Click and hold for additional options"},fr=class extends L{constructor(){super(...arguments),this.placement="bottom",this.offset=6,this.disabled=!1,this.hasLongpressContent=!1,this._longpressId="longpress-describedby-descriptor",this.abortOverlay=()=>{},this.openStatePromise=Promise.resolve()}static get styles(){return[Es]}handleClose(r){r&&r.detail.interaction!==this.open&&r.detail.interaction!==this.type||this.removeAttribute("open")}render(){return u`
            <slot
                id="trigger"
                @click=${this.onTrigger}
                @longpress=${this.onTrigger}
                @mouseenter=${this.onTrigger}
                @mouseleave=${this.onTrigger}
                @focusin=${this.onTrigger}
                @focusout=${this.onTrigger}
                @sp-closed=${this.handleClose}
                @slotchange=${this.onTargetSlotChange}
                name="trigger"
            ></slot>
            <div id="overlay-content">
                <slot
                    @slotchange=${this.onClickSlotChange}
                    name="click-content"
                ></slot>
                <slot
                    @slotchange=${this.onLongpressSlotChange}
                    name="longpress-content"
                ></slot>
                <slot
                    @slotchange=${this.onHoverSlotChange}
                    name="hover-content"
                ></slot>
                <slot name=${this._longpressId}></slot>
            </div>
        `}updated(r){super.updated(r),this.disabled&&r.has("disabled")?this.closeAllOverlays():(r.has("open")&&this.manageOpen(),r.has("hasLongpressContent")&&this.manageLongpressDescriptor())}manageLongpressDescriptor(){const r=this.querySelector('[slot="trigger"]'),t=r.getAttribute("aria-describedby");let e=t?t.split(/\s+/):[];if(this.hasLongpressContent){this.longpressDescriptor||(this.longpressDescriptor=document.createElement("div"),this.longpressDescriptor.id=this._longpressId,this.longpressDescriptor.slot=this._longpressId);const o=xo()||ko()?"touch":"keyboard";this.longpressDescriptor.textContent=Ss[o],this.appendChild(this.longpressDescriptor),e.push(this._longpressId)}else this.longpressDescriptor&&this.longpressDescriptor.remove(),e=e.filter(o=>o!==this._longpressId);e.length?r.setAttribute("aria-describedby",e.join(" ")):r.removeAttribute("aria-describedby")}closeAllOverlays(){this.abortOverlay&&this.abortOverlay(!0),["closeClickOverlay","closeHoverOverlay","closeLongpressOverlay"].forEach(async r=>{const t=this[r];t!=null&&(delete this[r],(await t)())}),this.overlaidContent=void 0}manageOpen(){var r;({click:()=>this.onTriggerClick(),hover:()=>this.onTriggerMouseEnter(),longpress:()=>this.onTriggerLongpress(),none:()=>this.closeAllOverlays()})[(r=this.open)!=null?r:"none"]()}async openOverlay(r,t,e,o){return this.openStatePromise=new Promise(a=>this.openStateResolver=a),this.addEventListener("sp-opened",()=>{this.openStateResolver()},{once:!0}),this.overlaidContent=e,fr.openOverlay(r,t,e,o)}get overlayOptions(){return{offset:this.offset,placement:this.placement,receivesFocus:this.type&&this.type!=="inline"&&this.open!=="hover"?"auto":void 0}}onTrigger(r){if(r.type==="mouseleave"&&this.open==="hover"&&r.relatedTarget===this.overlaidContent&&this.overlaidContent)this.overlaidContent.addEventListener("mouseleave",t=>{t.relatedTarget!==this.targetContent&&this.onTrigger(t)},{once:!0});else if(!this.disabled)switch(r.type){case"mouseenter":case"focusin":return void(!this.open&&this.hoverContent&&(this.open="hover"));case"mouseleave":case"focusout":return void(this.open==="hover"&&this.handleClose());case"click":return void(this.clickContent&&(this.open=r.type));case"longpress":return void(this.longpressContent&&(this._longpressEvent=r,this.open=r.type))}}prepareToFocusOverlayContent(r){this.type==="modal"&&(Fe(r)||(r.tabIndex=0))}async onTriggerClick(){if(!this.targetContent||!this.clickContent||this.closeClickOverlay)return;const{targetContent:r,clickContent:t}=this;this.closeAllOverlays(),this.prepareToFocusOverlayContent(t),this.closeClickOverlay=this.openOverlay(r,this.type?this.type:"click",t,this.overlayOptions)}async onTriggerLongpress(){var r,t;if(!this.targetContent||!this.longpressContent||this.closeLongpressOverlay)return;const{targetContent:e,longpressContent:o}=this;this.closeAllOverlays(),this.prepareToFocusOverlayContent(o);const a=((t=(r=this._longpressEvent)==null?void 0:r.detail)==null?void 0:t.source)!=="keyboard";this.closeLongpressOverlay=this.openOverlay(e,this.type?this.type:"longpress",o,{...this.overlayOptions,receivesFocus:"auto",notImmediatelyClosable:a}),this._longpressEvent=void 0}async onTriggerMouseEnter(){if(!this.targetContent||!this.hoverContent||this.closeHoverOverlay)return;const r=new Promise(o=>{this.abortOverlay=o}),{targetContent:t,hoverContent:e}=this;this.closeHoverOverlay=this.openOverlay(t,"hover",e,{abortPromise:r,...this.overlayOptions})}onClickSlotChange(r){this.clickContent=this.extractSlotContentFromEvent(r),this.manageOpen()}onLongpressSlotChange(r){this.longpressContent=this.extractSlotContentFromEvent(r),this.hasLongpressContent=!!this.longpressContent||!!this.closeLongpressOverlay,this.manageOpen()}onHoverSlotChange(r){this.hoverContent=this.extractSlotContentFromEvent(r),this.manageOpen()}onTargetSlotChange(r){this.targetContent=this.extractSlotContentFromEvent(r)}extractSlotContentFromEvent(r){return r.target.assignedNodes({flatten:!0}).find(t=>t instanceof HTMLElement)}async getUpdateComplete(){const r=await super.getUpdateComplete();return await this.openStatePromise,r}disconnectedCallback(){this.closeAllOverlays(),super.disconnectedCallback()}};let K=fr;K.openOverlay=async(r,t,e,o)=>de(r,t,e,o),pt([l({reflect:!0})],K.prototype,"placement",2),pt([l()],K.prototype,"type",2),pt([l({type:Number,reflect:!0})],K.prototype,"offset",2),pt([l({reflect:!0})],K.prototype,"open",2),pt([l({type:Boolean,reflect:!0})],K.prototype,"disabled",2),pt([Wt()],K.prototype,"hasLongpressContent",2),customElements.define("overlay-trigger",K);var Ts=p`
.fill-submask-2{animation:spectrum-fill-mask-2 1s linear infinite}@keyframes spectrum-fill-mask-1{0%{transform:rotate(90deg)}1.69%{transform:rotate(72.3deg)}3.39%{transform:rotate(55.5deg)}5.08%{transform:rotate(40.3deg)}6.78%{transform:rotate(25deg)}8.47%{transform:rotate(10.6deg)}10.17%{transform:rotate(0)}11.86%{transform:rotate(0)}13.56%{transform:rotate(0)}15.25%{transform:rotate(0)}16.95%{transform:rotate(0)}18.64%{transform:rotate(0)}20.34%{transform:rotate(0)}22.03%{transform:rotate(0)}23.73%{transform:rotate(0)}25.42%{transform:rotate(0)}27.12%{transform:rotate(0)}28.81%{transform:rotate(0)}30.51%{transform:rotate(0)}32.2%{transform:rotate(0)}33.9%{transform:rotate(0)}35.59%{transform:rotate(0)}37.29%{transform:rotate(0)}38.98%{transform:rotate(0)}40.68%{transform:rotate(0)}42.37%{transform:rotate(5.3deg)}44.07%{transform:rotate(13.4deg)}45.76%{transform:rotate(20.6deg)}47.46%{transform:rotate(29deg)}49.15%{transform:rotate(36.5deg)}50.85%{transform:rotate(42.6deg)}52.54%{transform:rotate(48.8deg)}54.24%{transform:rotate(54.2deg)}55.93%{transform:rotate(59.4deg)}57.63%{transform:rotate(63.2deg)}59.32%{transform:rotate(67.2deg)}61.02%{transform:rotate(70.8deg)}62.71%{transform:rotate(73.8deg)}64.41%{transform:rotate(76.2deg)}66.1%{transform:rotate(78.7deg)}67.8%{transform:rotate(80.6deg)}69.49%{transform:rotate(82.6deg)}71.19%{transform:rotate(83.7deg)}72.88%{transform:rotate(85deg)}74.58%{transform:rotate(86.3deg)}76.27%{transform:rotate(87deg)}77.97%{transform:rotate(87.7deg)}79.66%{transform:rotate(88.3deg)}81.36%{transform:rotate(88.6deg)}83.05%{transform:rotate(89.2deg)}84.75%{transform:rotate(89.2deg)}86.44%{transform:rotate(89.5deg)}88.14%{transform:rotate(89.9deg)}89.83%{transform:rotate(89.7deg)}91.53%{transform:rotate(90.1deg)}93.22%{transform:rotate(90.2deg)}94.92%{transform:rotate(90.1deg)}96.61%{transform:rotate(90deg)}98.31%{transform:rotate(89.8deg)}to{transform:rotate(90deg)}}@keyframes spectrum-fill-mask-2{0%{transform:rotate(180deg)}1.69%{transform:rotate(180deg)}3.39%{transform:rotate(180deg)}5.08%{transform:rotate(180deg)}6.78%{transform:rotate(180deg)}8.47%{transform:rotate(180deg)}10.17%{transform:rotate(179.2deg)}11.86%{transform:rotate(164deg)}13.56%{transform:rotate(151.8deg)}15.25%{transform:rotate(140.8deg)}16.95%{transform:rotate(130.3deg)}18.64%{transform:rotate(120.4deg)}20.34%{transform:rotate(110.8deg)}22.03%{transform:rotate(101.6deg)}23.73%{transform:rotate(93.5deg)}25.42%{transform:rotate(85.4deg)}27.12%{transform:rotate(78.1deg)}28.81%{transform:rotate(71.2deg)}30.51%{transform:rotate(89.1deg)}32.2%{transform:rotate(105.5deg)}33.9%{transform:rotate(121.3deg)}35.59%{transform:rotate(135.5deg)}37.29%{transform:rotate(148.4deg)}38.98%{transform:rotate(161deg)}40.68%{transform:rotate(173.5deg)}42.37%{transform:rotate(180deg)}44.07%{transform:rotate(180deg)}45.76%{transform:rotate(180deg)}47.46%{transform:rotate(180deg)}49.15%{transform:rotate(180deg)}50.85%{transform:rotate(180deg)}52.54%{transform:rotate(180deg)}54.24%{transform:rotate(180deg)}55.93%{transform:rotate(180deg)}57.63%{transform:rotate(180deg)}59.32%{transform:rotate(180deg)}61.02%{transform:rotate(180deg)}62.71%{transform:rotate(180deg)}64.41%{transform:rotate(180deg)}66.1%{transform:rotate(180deg)}67.8%{transform:rotate(180deg)}69.49%{transform:rotate(180deg)}71.19%{transform:rotate(180deg)}72.88%{transform:rotate(180deg)}74.58%{transform:rotate(180deg)}76.27%{transform:rotate(180deg)}77.97%{transform:rotate(180deg)}79.66%{transform:rotate(180deg)}81.36%{transform:rotate(180deg)}83.05%{transform:rotate(180deg)}84.75%{transform:rotate(180deg)}86.44%{transform:rotate(180deg)}88.14%{transform:rotate(180deg)}89.83%{transform:rotate(180deg)}91.53%{transform:rotate(180deg)}93.22%{transform:rotate(180deg)}94.92%{transform:rotate(180deg)}96.61%{transform:rotate(180deg)}98.31%{transform:rotate(180deg)}to{transform:rotate(180deg)}}@keyframes spectrum-fills-rotate{0%{transform:rotate(-90deg)}to{transform:rotate(270deg)}}:host{--spectrum-progress-circle-track-border-color:var(--spectrum-gray-300);--spectrum-progress-circle-fill-border-color:var(
--spectrum-accent-content-color-default
);--spectrum-progress-circle-track-border-color-over-background:var(
--spectrum-transparent-white-300
);--spectrum-progress-circle-fill-border-color-over-background:var(
--spectrum-transparent-white-900
);--spectrum-progress-circle-size:var(
--spectrum-progress-circle-size-medium
);--spectrum-progress-circle-thickness:var(
--spectrum-progress-circle-thickness-medium
);--spectrum-progress-circle-track-border-style:solid}:host([size=s]){--spectrum-progress-circle-size:var(--spectrum-progress-circle-size-small);--spectrum-progress-circle-thickness:var(
--spectrum-progress-circle-thickness-small
)}.spectrum-ProgressCircle--medium{--spectrum-progress-circle-size:var(
--spectrum-progress-circle-size-medium
);--spectrum-progress-circle-thickness:var(
--spectrum-progress-circle-thickness-medium
)}:host([size=l]){--spectrum-progress-circle-size:var(--spectrum-progress-circle-size-large);--spectrum-progress-circle-thickness:var(
--spectrum-progress-circle-thickness-large
)}@media (forced-colors:active){:host{--highcontrast-progress-circle-fill-border-color:Highlight;--highcontrast-progress-circle-fill-border-color-over-background:Highlight}.track{--spectrum-progress-circle-track-border-style:double}}:host{block-size:var(
--mod-progress-circle-size,var(--spectrum-progress-circle-size)
);direction:ltr;display:inline-block;inline-size:var(
--mod-progress-circle-size,var(--spectrum-progress-circle-size)
);position:relative;transform:translateZ(0)}.track{block-size:var(
--mod-progress-circle-size,var(--spectrum-progress-circle-size)
);border-color:var(
--mod-progress-circle-track-border-color,var(--spectrum-progress-circle-track-border-color)
);border-radius:var(
--mod-progress-circle-size,var(--spectrum-progress-circle-size)
);border-style:var(
--highcontrast-progress-circle-track-border-style,var(
--mod-progress-circle-track-border-style,var(--spectrum-progress-circle-track-border-style)
)
);border-width:var(
--mod-progress-circle-thickness,var(--spectrum-progress-circle-thickness)
);box-sizing:border-box;inline-size:var(
--mod-progress-circle-size,var(--spectrum-progress-circle-size)
)}.fills{block-size:100%;inline-size:100%;inset-block-start:0;inset-inline-start:0;position:absolute}.fill{block-size:var(
--mod-progress-circle-size,var(--spectrum-progress-circle-size)
);border-color:var(
--highcontrast-progress-circle-fill-border-color,var(
--mod-progress-circle-fill-border-color,var(--spectrum-progress-circle-fill-border-color)
)
);border-radius:var(
--mod-progress-circle-size,var(--spectrum-progress-circle-size)
);border-style:solid;border-width:var(
--mod-progress-circle-thickness,var(--spectrum-progress-circle-thickness)
);box-sizing:border-box;inline-size:var(
--mod-progress-circle-size,var(--spectrum-progress-circle-size)
)}:host([static=white]) .track{border-color:var(
--mod-progress-circle-track-border-color-over-background,var(--spectrum-progress-circle-track-border-color-over-background)
)}:host([static=white]) .fill{border-color:var(
--highcontrast-progress-circle-fill-border-color-over-background,var(
--mod-progress-circle-fill-border-color-over-background,var(--spectrum-progress-circle-fill-border-color-over-background)
)
)}.fillMask1,.fillMask2{block-size:100%;inline-size:50%;overflow:hidden;position:absolute;transform:rotate(180deg);transform-origin:100%}.fillSubMask1,.fillSubMask2{block-size:100%;inline-size:100%;overflow:hidden;transform:rotate(-180deg);transform-origin:100%}.fillMask2{transform:rotate(0)}:host([indeterminate]) .fills{animation:spectrum-fills-rotate 1s cubic-bezier(.25,.78,.48,.89) infinite;transform:translateZ(0);transform-origin:center;will-change:transform}:host([indeterminate]) .fillSubMask1{animation:spectrum-fill-mask-1 1s linear infinite;transform:translateZ(0);will-change:transform}:host([indeterminate]) .fillSubMask2{animation:spectrum-fill-mask-2 1s linear infinite;transform:translateZ(0);will-change:transform}:host{--spectrum-progresscircle-m-over-background-track-fill-color:var(
--spectrum-alias-track-fill-color-overbackground
)}
`,$s=Object.defineProperty,_s=Object.getOwnPropertyDescriptor,zt=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?_s(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&$s(t,e,s),s};class dt extends R(L,{validSizes:["s","m","l"]}){constructor(){super(...arguments),this.indeterminate=!1,this.label="",this.overBackground=!1,this.progress=0}static get styles(){return[Ts]}makeRotation(t){return this.indeterminate?void 0:`transform: rotate(${t}deg);`}willUpdate(t){t.has("overBackground")&&(this.static=this.overBackground?"white":this.static||void 0)}render(){const t=[this.makeRotation(3.6*Math.min(this.progress,50)-180),this.makeRotation(3.6*Math.max(this.progress-50,0)-180)];return u`
            <div class="track"></div>
            <div class="fills">
                ${["Mask1","Mask2"].map((e,o)=>u`
                        <div class="fill${e}">
                            <div
                                class="fillSub${e}"
                                style=${b(t[o])}
                            >
                                <div class="fill"></div>
                            </div>
                        </div>
                    `)}
            </div>
        `}firstUpdated(t){super.firstUpdated(t),this.hasAttribute("role")||this.setAttribute("role","progressbar")}updated(t){super.updated(t),!this.indeterminate&&t.has("progress")?this.setAttribute("aria-valuenow",""+this.progress):this.hasAttribute("aria-valuenow")&&this.removeAttribute("aria-valuenow"),this.label&&t.has("label")&&this.setAttribute("aria-label",this.label)}}zt([l({type:Boolean,reflect:!0})],dt.prototype,"indeterminate",2),zt([l({type:String})],dt.prototype,"label",2),zt([l({type:Boolean,reflect:!0,attribute:"over-background"})],dt.prototype,"overBackground",2),zt([l({reflect:!0})],dt.prototype,"static",2),zt([l({type:Number})],dt.prototype,"progress",2),customElements.define("sp-progress-circle",dt);var Hs=p`
:host{--spectrum-illustratedmessage-description-max-width:500px;--spectrum-illustratedmessage-heading-max-width:500px;--spectrum-illustratedmessage-illustration-margin-bottom:24px;--spectrum-illustratedmessage-heading-margin:0;--spectrum-illustratedmessage-description-margin:4px 0 0 0}:host{align-items:center;display:flex;flex-direction:column;height:100%;justify-content:center;text-align:center}#illustration{margin-bottom:var(
--spectrum-illustratedmessage-illustration-margin-bottom
)}#heading{color:var(
--spectrum-illustratedmessage-heading-color,var(--spectrum-global-color-gray-800)
);font-size:var(
--spectrum-illustratedmessage-heading-font-size,var(--spectrum-alias-heading-m-text-size)
);font-weight:var(
--spectrum-illustratedmessage-heading-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);margin:var(--spectrum-illustratedmessage-heading-margin);max-width:var(--spectrum-illustratedmessage-heading-max-width)}#description{color:var(
--spectrum-illustratedmessage-description-color,var(--spectrum-global-color-gray-700)
);font-style:var(
--spectrum-illustratedmessage-description-font-style,var(--spectrum-global-font-style-regular)
);margin:var(--spectrum-illustratedmessage-description-margin);max-width:var(--spectrum-illustratedmessage-description-max-width)}:host([cta]) #description{font-style:var(
--spectrum-illustratedmessage-description-font-style,var(--spectrum-global-font-style-regular)
)}#illustration{fill:currentColor;stroke:currentColor;color:var(--spectrum-global-color-gray-500)}::slotted(svg[viewBox]){width:100%}
`;const yr=p`
.spectrum{color:var(--spectrum-body-m-text-color,var(--spectrum-alias-text-color));font-family:var(
--spectrum-alias-body-text-font-family,var(--spectrum-global-font-family-base)
);font-size:var(
--spectrum-alias-font-size-default,var(--spectrum-global-dimension-font-size-100)
)}
`,xr=p`
.spectrum:lang(ar){font-family:var(
--spectrum-alias-font-family-ar,var(--spectrum-global-font-font-family-ar)
)}.spectrum:lang(he){font-family:var(
--spectrum-alias-font-family-he,var(--spectrum-global-font-font-family-he)
)}.spectrum:lang(zh-Hans){font-family:var(
--spectrum-alias-font-family-zhhans,var(--spectrum-global-font-font-family-zhhans)
)}.spectrum:lang(zh-Hant){font-family:var(
--spectrum-alias-font-family-zh,var(--spectrum-global-font-font-family-zh)
)}.spectrum:lang(zh){font-family:var(
--spectrum-alias-font-family-zh,var(--spectrum-global-font-font-family-zh)
)}.spectrum:lang(ko){font-family:var(
--spectrum-alias-font-family-ko,var(--spectrum-global-font-font-family-ko)
)}.spectrum:lang(ja){font-family:var(
--spectrum-alias-font-family-ja,var(--spectrum-global-font-font-family-ja)
)}.spectrum:lang(ja) .spectrum-Heading--sizeXXXL,.spectrum:lang(ko) .spectrum-Heading--sizeXXXL,.spectrum:lang(zh) .spectrum-Heading--sizeXXXL{font-size:var(
--spectrum-heading-han-xxxl-text-size,var(--spectrum-alias-heading-han-xxxl-text-size)
);font-style:var(
--spectrum-heading-han-xxxl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-xxxl-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-han-xxxl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-heading-han-xxxl-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-han-xxxl-text-transform,none)}.spectrum:lang(ja) .spectrum-Heading--sizeXXL,.spectrum:lang(ko) .spectrum-Heading--sizeXXL,.spectrum:lang(zh) .spectrum-Heading--sizeXXL{font-size:var(
--spectrum-heading-han-xxl-text-size,var(--spectrum-alias-heading-han-xxl-text-size)
);font-style:var(
--spectrum-heading-han-xxl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-xxl-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-han-xxl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-heading-han-xxl-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-han-xxl-text-transform,none)}.spectrum:lang(ja) .spectrum-Heading--sizeXL,.spectrum:lang(ko) .spectrum-Heading--sizeXL,.spectrum:lang(zh) .spectrum-Heading--sizeXL{font-size:var(
--spectrum-heading-han-xl-text-size,var(--spectrum-alias-heading-han-xl-text-size)
);font-style:var(
--spectrum-heading-han-xl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-xl-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-han-xl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-heading-han-xl-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-han-xl-text-transform,none)}.spectrum:lang(ja) .spectrum-Heading--sizeL,.spectrum:lang(ko) .spectrum-Heading--sizeL,.spectrum:lang(zh) .spectrum-Heading--sizeL{font-size:var(
--spectrum-heading-han-l-text-size,var(--spectrum-alias-heading-han-l-text-size)
);font-style:var(
--spectrum-heading-han-l-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-l-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-han-l-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-heading-han-l-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-han-l-text-transform,none)}.spectrum:lang(ja) .spectrum-Heading--sizeM,.spectrum:lang(ko) .spectrum-Heading--sizeM,.spectrum:lang(zh) .spectrum-Heading--sizeM{font-size:var(
--spectrum-heading-han-m-text-size,var(--spectrum-alias-heading-han-m-text-size)
);font-style:var(
--spectrum-heading-han-m-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-m-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-han-m-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-heading-han-m-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-han-m-text-transform,none)}.spectrum:lang(ja) .spectrum-Heading--sizeS,.spectrum:lang(ko) .spectrum-Heading--sizeS,.spectrum:lang(zh) .spectrum-Heading--sizeS{font-size:var(
--spectrum-heading-han-s-text-size,var(--spectrum-alias-heading-han-s-text-size)
);font-style:var(
--spectrum-heading-han-s-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-s-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-han-s-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-heading-han-s-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-han-s-text-transform,none)}.spectrum:lang(ja) .spectrum-Heading--sizeXS,.spectrum:lang(ko) .spectrum-Heading--sizeXS,.spectrum:lang(zh) .spectrum-Heading--sizeXS{font-size:var(
--spectrum-heading-han-xs-text-size,var(--spectrum-alias-heading-han-xs-text-size)
);font-style:var(
--spectrum-heading-han-xs-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-xs-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-han-xs-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-heading-han-xs-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-han-xs-text-transform,none)}.spectrum:lang(ja) .spectrum-Heading--sizeXXS,.spectrum:lang(ko) .spectrum-Heading--sizeXXS,.spectrum:lang(zh) .spectrum-Heading--sizeXXS{font-size:var(
--spectrum-heading-han-xxs-text-size,var(--spectrum-alias-heading-han-xxs-text-size)
);font-style:var(
--spectrum-heading-han-xxs-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-xxs-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-han-xxs-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-heading-han-xxs-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-han-xxs-text-transform,none)}.spectrum:lang(ja) .spectrum-Heading--heavy,.spectrum:lang(ko) .spectrum-Heading--heavy,.spectrum:lang(zh) .spectrum-Heading--heavy{font-weight:var(
--spectrum-heading-han-m-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
)}.spectrum:lang(ja) .spectrum-Heading--heavy .spectrum-Heading--emphasized,.spectrum:lang(ja) .spectrum-Heading--heavy em,.spectrum:lang(ko) .spectrum-Heading--heavy .spectrum-Heading--emphasized,.spectrum:lang(ko) .spectrum-Heading--heavy em,.spectrum:lang(zh) .spectrum-Heading--heavy .spectrum-Heading--emphasized,.spectrum:lang(zh) .spectrum-Heading--heavy em{font-style:var(--spectrum-heading-han-heavy-m-emphasized-text-font-style);font-weight:var(
--spectrum-heading-han-heavy-m-emphasized-text-font-weight
)}.spectrum:lang(ja) .spectrum-Heading--heavy .spectrum-Heading--strong,.spectrum:lang(ja) .spectrum-Heading--heavy strong,.spectrum:lang(ko) .spectrum-Heading--heavy .spectrum-Heading--strong,.spectrum:lang(ko) .spectrum-Heading--heavy strong,.spectrum:lang(zh) .spectrum-Heading--heavy .spectrum-Heading--strong,.spectrum:lang(zh) .spectrum-Heading--heavy strong{font-style:var(
--spectrum-heading-m-heavy-strong-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-m-heavy-strong-text-font-weight,var(--spectrum-alias-heading-text-font-weight-heavy-strong)
)}.spectrum:lang(ja) .spectrum-Heading--light,.spectrum:lang(ko) .spectrum-Heading--light,.spectrum:lang(zh) .spectrum-Heading--light{font-weight:var(
--spectrum-heading-han-m-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
)}.spectrum:lang(ja) .spectrum-Heading--light .spectrum-Heading--emphasized,.spectrum:lang(ja) .spectrum-Heading--light em,.spectrum:lang(ko) .spectrum-Heading--light .spectrum-Heading--emphasized,.spectrum:lang(ko) .spectrum-Heading--light em,.spectrum:lang(zh) .spectrum-Heading--light .spectrum-Heading--emphasized,.spectrum:lang(zh) .spectrum-Heading--light em{font-style:var(
--spectrum-heading-han-m-light-emphasized-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-m-light-emphasized-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-light-emphasis)
)}.spectrum:lang(ja) .spectrum-Heading--light .spectrum-Heading--strong,.spectrum:lang(ja) .spectrum-Heading--light strong,.spectrum:lang(ko) .spectrum-Heading--light .spectrum-Heading--strong,.spectrum:lang(ko) .spectrum-Heading--light strong,.spectrum:lang(zh) .spectrum-Heading--light .spectrum-Heading--strong,.spectrum:lang(zh) .spectrum-Heading--light strong{font-style:var(
--spectrum-heading-han-m-light-strong-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-han-m-light-strong-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-light-strong)
)}.spectrum:lang(ja) .spectrum-Body--sizeXXXL,.spectrum:lang(ko) .spectrum-Body--sizeXXXL,.spectrum:lang(zh) .spectrum-Body--sizeXXXL{font-size:var(
--spectrum-body-han-xxxl-text-size,var(--spectrum-global-dimension-font-size-600)
);font-style:var(
--spectrum-body-han-xxxl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-han-xxxl-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-body-han-xxxl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-body-han-xxxl-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-han-xxxl-text-transform,none)}.spectrum:lang(ja) .spectrum-Body--sizeXXL,.spectrum:lang(ko) .spectrum-Body--sizeXXL,.spectrum:lang(zh) .spectrum-Body--sizeXXL{font-size:var(
--spectrum-body-han-xxl-text-size,var(--spectrum-global-dimension-font-size-500)
);font-style:var(
--spectrum-body-han-xxl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-han-xxl-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-body-han-xxl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-body-han-xxl-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-han-xxl-text-transform,none)}.spectrum:lang(ja) .spectrum-Body--sizeXL,.spectrum:lang(ko) .spectrum-Body--sizeXL,.spectrum:lang(zh) .spectrum-Body--sizeXL{font-size:var(
--spectrum-body-han-xl-text-size,var(--spectrum-global-dimension-font-size-400)
);font-style:var(
--spectrum-body-han-xl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-han-xl-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-body-han-xl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-body-han-xl-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-han-xl-text-transform,none)}.spectrum:lang(ja) .spectrum-Body--sizeL,.spectrum:lang(ko) .spectrum-Body--sizeL,.spectrum:lang(zh) .spectrum-Body--sizeL{font-size:var(
--spectrum-body-han-l-text-size,var(--spectrum-global-dimension-font-size-300)
);font-style:var(
--spectrum-body-han-l-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-han-l-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-body-han-l-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-body-han-l-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-han-l-text-transform,none)}.spectrum:lang(ja) .spectrum-Body--sizeM,.spectrum:lang(ko) .spectrum-Body--sizeM,.spectrum:lang(zh) .spectrum-Body--sizeM{font-size:var(
--spectrum-body-han-m-text-size,var(--spectrum-global-dimension-font-size-200)
);font-style:var(
--spectrum-body-han-m-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-han-m-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-body-han-m-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-body-han-m-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-han-m-text-transform,none)}.spectrum:lang(ja) .spectrum-Body--sizeS,.spectrum:lang(ko) .spectrum-Body--sizeS,.spectrum:lang(zh) .spectrum-Body--sizeS{font-size:var(
--spectrum-body-han-s-text-size,var(--spectrum-global-dimension-font-size-100)
);font-style:var(
--spectrum-body-han-s-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-han-s-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-body-han-s-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-body-han-s-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-han-s-text-transform,none)}.spectrum:lang(ja) .spectrum-Body--sizeXS,.spectrum:lang(ko) .spectrum-Body--sizeXS,.spectrum:lang(zh) .spectrum-Body--sizeXS{font-size:var(
--spectrum-body-han-xs-text-size,var(--spectrum-global-dimension-font-size-75)
);font-style:var(
--spectrum-body-han-xs-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-han-xs-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-body-han-xs-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-body-han-xs-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-han-xs-text-transform,none)}.spectrum:lang(ja) .spectrum-Detail--sizeXL,.spectrum:lang(ko) .spectrum-Detail--sizeXL,.spectrum:lang(zh) .spectrum-Detail--sizeXL{font-size:var(
--spectrum-detail-han-xl-text-size,var(--spectrum-global-dimension-font-size-200)
);font-style:var(
--spectrum-detail-han-xl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-xl-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-detail-han-xl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-xl-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-detail-han-xl-text-transform,uppercase)}.spectrum:lang(ja) .spectrum-Detail--sizeXL em,.spectrum:lang(ko) .spectrum-Detail--sizeXL em,.spectrum:lang(zh) .spectrum-Detail--sizeXL em{font-size:var(
--spectrum-detail-han-xl-emphasized-text-size,var(--spectrum-global-dimension-font-size-200)
);font-style:var(
--spectrum-detail-han-xl-emphasized-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-xl-emphasized-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular-emphasis)
);letter-spacing:var(
--spectrum-detail-han-xl-emphasized-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-xl-emphasized-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(
--spectrum-detail-han-xl-emphasized-text-transform,uppercase
)}.spectrum:lang(ja) .spectrum-Detail--sizeXL strong,.spectrum:lang(ko) .spectrum-Detail--sizeXL strong,.spectrum:lang(zh) .spectrum-Detail--sizeXL strong{font-size:var(
--spectrum-detail-han-xl-strong-text-size,var(--spectrum-global-dimension-font-size-200)
);font-style:var(
--spectrum-detail-han-xl-strong-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-xl-strong-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular-strong)
);letter-spacing:var(
--spectrum-detail-han-xl-strong-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-xl-strong-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(
--spectrum-detail-han-xl-strong-text-transform,uppercase
)}.spectrum:lang(ja) .spectrum-Detail--sizeL,.spectrum:lang(ko) .spectrum-Detail--sizeL,.spectrum:lang(zh) .spectrum-Detail--sizeL{font-size:var(
--spectrum-detail-han-l-text-size,var(--spectrum-global-dimension-font-size-100)
);font-style:var(
--spectrum-detail-han-l-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-l-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-detail-han-l-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-l-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-detail-han-l-text-transform,uppercase)}.spectrum:lang(ja) .spectrum-Detail--sizeL em,.spectrum:lang(ko) .spectrum-Detail--sizeL em,.spectrum:lang(zh) .spectrum-Detail--sizeL em{font-size:var(
--spectrum-detail-han-l-emphasized-text-size,var(--spectrum-global-dimension-font-size-100)
);font-style:var(
--spectrum-detail-han-l-emphasized-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-l-emphasized-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular-emphasis)
);letter-spacing:var(
--spectrum-detail-han-l-emphasized-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-l-emphasized-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(
--spectrum-detail-han-l-emphasized-text-transform,uppercase
)}.spectrum:lang(ja) .spectrum-Detail--sizeL strong,.spectrum:lang(ko) .spectrum-Detail--sizeL strong,.spectrum:lang(zh) .spectrum-Detail--sizeL strong{font-size:var(
--spectrum-detail-han-l-strong-text-size,var(--spectrum-global-dimension-font-size-100)
);font-style:var(
--spectrum-detail-han-l-strong-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-l-strong-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular-strong)
);letter-spacing:var(
--spectrum-detail-han-l-strong-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-l-strong-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(
--spectrum-detail-han-l-strong-text-transform,uppercase
)}.spectrum:lang(ja) .spectrum-Detail--sizeM,.spectrum:lang(ko) .spectrum-Detail--sizeM,.spectrum:lang(zh) .spectrum-Detail--sizeM{font-size:var(
--spectrum-detail-han-m-text-size,var(--spectrum-global-dimension-font-size-75)
);font-style:var(
--spectrum-detail-han-m-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-m-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-detail-han-m-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-m-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-detail-han-m-text-transform,uppercase)}.spectrum:lang(ja) .spectrum-Detail--sizeM em,.spectrum:lang(ko) .spectrum-Detail--sizeM em,.spectrum:lang(zh) .spectrum-Detail--sizeM em{font-size:var(
--spectrum-detail-han-m-emphasized-text-size,var(--spectrum-global-dimension-font-size-75)
);font-style:var(
--spectrum-detail-han-m-emphasized-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-m-emphasized-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular-emphasis)
);letter-spacing:var(
--spectrum-detail-han-m-emphasized-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-m-emphasized-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(
--spectrum-detail-han-m-emphasized-text-transform,uppercase
)}.spectrum:lang(ja) .spectrum-Detail--sizeM strong,.spectrum:lang(ko) .spectrum-Detail--sizeM strong,.spectrum:lang(zh) .spectrum-Detail--sizeM strong{font-size:var(
--spectrum-detail-han-m-strong-text-size,var(--spectrum-global-dimension-font-size-75)
);font-style:var(
--spectrum-detail-han-m-strong-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-m-strong-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular-strong)
);letter-spacing:var(
--spectrum-detail-han-m-strong-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-m-strong-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(
--spectrum-detail-han-m-strong-text-transform,uppercase
)}.spectrum:lang(ja) .spectrum-Detail--sizeS,.spectrum:lang(ko) .spectrum-Detail--sizeS,.spectrum:lang(zh) .spectrum-Detail--sizeS{font-size:var(
--spectrum-detail-han-s-text-size,var(--spectrum-global-dimension-font-size-50)
);font-style:var(
--spectrum-detail-han-s-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-s-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-detail-han-s-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-s-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-detail-han-s-text-transform,uppercase)}.spectrum:lang(ja) .spectrum-Detail--sizeS em,.spectrum:lang(ko) .spectrum-Detail--sizeS em,.spectrum:lang(zh) .spectrum-Detail--sizeS em{font-size:var(
--spectrum-detail-han-s-emphasized-text-size,var(--spectrum-global-dimension-font-size-50)
);font-style:var(
--spectrum-detail-han-s-emphasized-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-s-emphasized-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular-emphasis)
);letter-spacing:var(
--spectrum-detail-han-s-emphasized-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-s-emphasized-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(
--spectrum-detail-han-s-emphasized-text-transform,uppercase
)}.spectrum:lang(ja) .spectrum-Detail--sizeS strong,.spectrum:lang(ko) .spectrum-Detail--sizeS strong,.spectrum:lang(zh) .spectrum-Detail--sizeS strong{font-size:var(
--spectrum-detail-han-s-strong-text-size,var(--spectrum-global-dimension-font-size-50)
);font-style:var(
--spectrum-detail-han-s-strong-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-s-strong-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular-strong)
);letter-spacing:var(
--spectrum-detail-han-s-strong-text-letter-spacing,var(--spectrum-global-font-letter-spacing-medium)
);line-height:var(
--spectrum-detail-han-s-strong-text-line-height,var(--spectrum-alias-han-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(
--spectrum-detail-han-s-strong-text-transform,uppercase
)}.spectrum:lang(ja) .spectrum-Detail--light,.spectrum:lang(ko) .spectrum-Detail--light,.spectrum:lang(zh) .spectrum-Detail--light{font-weight:var(
--spectrum-detail-han-m-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-regular)
)}.spectrum:lang(ja) .spectrum-Detail--light .spectrum-Detail--emphasized,.spectrum:lang(ja) .spectrum-Detail--light em,.spectrum:lang(ko) .spectrum-Detail--light .spectrum-Detail--emphasized,.spectrum:lang(ko) .spectrum-Detail--light em,.spectrum:lang(zh) .spectrum-Detail--light .spectrum-Detail--emphasized,.spectrum:lang(zh) .spectrum-Detail--light em{font-style:var(
--spectrum-detail-han-m-light-emphasized-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-m-light-emphasized-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-light-emphasis)
)}.spectrum:lang(ja) .spectrum-Detail--light .spectrum-Detail--strong,.spectrum:lang(ja) .spectrum-Detail--light strong,.spectrum:lang(ko) .spectrum-Detail--light .spectrum-Detail--strong,.spectrum:lang(ko) .spectrum-Detail--light strong,.spectrum:lang(zh) .spectrum-Detail--light .spectrum-Detail--strong,.spectrum:lang(zh) .spectrum-Detail--light strong{font-style:var(
--spectrum-detail-han-m-light-strong-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-detail-han-m-light-strong-text-font-weight,var(--spectrum-alias-han-heading-text-font-weight-light-strong)
)}.spectrum:lang(ja) .spectrum-Code--sizeXL,.spectrum:lang(ko) .spectrum-Code--sizeXL,.spectrum:lang(zh) .spectrum-Code--sizeXL{font-family:var(
--spectrum-code-han-xl-text-font-family,var(--spectrum-alias-font-family-zh)
);font-size:var(
--spectrum-code-han-xl-text-size,var(--spectrum-global-dimension-font-size-400)
);font-style:var(
--spectrum-code-han-xl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-code-han-xl-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-code-han-xl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-code-han-xl-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0}.spectrum:lang(ja) .spectrum-Code--sizeL,.spectrum:lang(ko) .spectrum-Code--sizeL,.spectrum:lang(zh) .spectrum-Code--sizeL{font-family:var(
--spectrum-code-han-l-text-font-family,var(--spectrum-alias-font-family-zh)
);font-size:var(
--spectrum-code-han-l-text-size,var(--spectrum-global-dimension-font-size-300)
);font-style:var(
--spectrum-code-han-l-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-code-han-l-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-code-han-l-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-code-han-l-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0}.spectrum:lang(ja) .spectrum-Code--sizeM,.spectrum:lang(ko) .spectrum-Code--sizeM,.spectrum:lang(zh) .spectrum-Code--sizeM{font-family:var(
--spectrum-code-han-m-text-font-family,var(--spectrum-alias-font-family-zh)
);font-size:var(
--spectrum-code-han-m-text-size,var(--spectrum-global-dimension-font-size-200)
);font-style:var(
--spectrum-code-han-m-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-code-han-m-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-code-han-m-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-code-han-m-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0}.spectrum:lang(ja) .spectrum-Code--sizeS,.spectrum:lang(ko) .spectrum-Code--sizeS,.spectrum:lang(zh) .spectrum-Code--sizeS{font-family:var(
--spectrum-code-han-s-text-font-family,var(--spectrum-alias-font-family-zh)
);font-size:var(
--spectrum-code-han-s-text-size,var(--spectrum-global-dimension-font-size-100)
);font-style:var(
--spectrum-code-han-s-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-code-han-s-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-code-han-s-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-code-han-s-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0}.spectrum:lang(ja) .spectrum-Code--sizeXS,.spectrum:lang(ko) .spectrum-Code--sizeXS,.spectrum:lang(zh) .spectrum-Code--sizeXS{font-family:var(
--spectrum-code-han-xs-text-font-family,var(--spectrum-alias-font-family-zh)
);font-size:var(
--spectrum-code-han-xs-text-size,var(--spectrum-global-dimension-font-size-75)
);font-style:var(
--spectrum-code-han-xs-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-code-han-xs-text-font-weight,var(--spectrum-alias-han-body-text-font-weight-regular)
);letter-spacing:var(
--spectrum-code-han-xs-text-letter-spacing,var(--spectrum-global-font-letter-spacing-han)
);line-height:var(
--spectrum-code-han-xs-text-line-height,var(--spectrum-alias-han-body-text-line-height)
);margin-bottom:0;margin-top:0}.spectrum:lang(ja) .spectrum-Body--sizeXXXL,.spectrum:lang(ko) .spectrum-Body--sizeXXXL,.spectrum:lang(zh) .spectrum-Body--sizeXXXL{color:var(
--spectrum-body-han-xxxl-text-color,var(--spectrum-alias-text-color)
)}.spectrum:lang(ja) .spectrum-Body--sizeXXL,.spectrum:lang(ko) .spectrum-Body--sizeXXL,.spectrum:lang(zh) .spectrum-Body--sizeXXL{color:var(
--spectrum-body-han-xxl-text-color,var(--spectrum-alias-text-color)
)}.spectrum:lang(ja) .spectrum-Body--sizeXL,.spectrum:lang(ko) .spectrum-Body--sizeXL,.spectrum:lang(zh) .spectrum-Body--sizeXL{color:var(
--spectrum-body-han-xl-text-color,var(--spectrum-alias-text-color)
)}.spectrum:lang(ja) .spectrum-Body--sizeL,.spectrum:lang(ko) .spectrum-Body--sizeL,.spectrum:lang(zh) .spectrum-Body--sizeL{color:var(
--spectrum-body-han-l-text-color,var(--spectrum-alias-text-color)
)}.spectrum:lang(ja) .spectrum-Body--sizeM,.spectrum:lang(ko) .spectrum-Body--sizeM,.spectrum:lang(zh) .spectrum-Body--sizeM{color:var(
--spectrum-body-han-m-text-color,var(--spectrum-alias-text-color)
)}.spectrum:lang(ja) .spectrum-Body--sizeS,.spectrum:lang(ko) .spectrum-Body--sizeS,.spectrum:lang(zh) .spectrum-Body--sizeS{color:var(
--spectrum-body-han-s-text-color,var(--spectrum-alias-text-color)
)}.spectrum:lang(ja) .spectrum-Body--sizeXS,.spectrum:lang(ko) .spectrum-Body--sizeXS,.spectrum:lang(zh) .spectrum-Body--sizeXS{color:var(
--spectrum-body-han-xs-text-color,var(--spectrum-alias-text-color)
)}.spectrum:lang(ja) .spectrum-Heading--sizeXXXL,.spectrum:lang(ko) .spectrum-Heading--sizeXXXL,.spectrum:lang(zh) .spectrum-Heading--sizeXXXL{color:var(
--spectrum-heading-xxxl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading--sizeXXL,.spectrum:lang(ko) .spectrum-Heading--sizeXXL,.spectrum:lang(zh) .spectrum-Heading--sizeXXL{color:var(
--spectrum-heading-xxl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading--sizeXL,.spectrum:lang(ko) .spectrum-Heading--sizeXL,.spectrum:lang(zh) .spectrum-Heading--sizeXL{color:var(
--spectrum-heading-xl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading--sizeL,.spectrum:lang(ko) .spectrum-Heading--sizeL,.spectrum:lang(zh) .spectrum-Heading--sizeL{color:var(
--spectrum-heading-l-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading--sizeM,.spectrum:lang(ko) .spectrum-Heading--sizeM,.spectrum:lang(zh) .spectrum-Heading--sizeM{color:var(
--spectrum-heading-m-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading--sizeS,.spectrum:lang(ko) .spectrum-Heading--sizeS,.spectrum:lang(zh) .spectrum-Heading--sizeS{color:var(
--spectrum-heading-s-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading--sizeXS,.spectrum:lang(ko) .spectrum-Heading--sizeXS,.spectrum:lang(zh) .spectrum-Heading--sizeXS{color:var(
--spectrum-heading-xs-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading--sizeXXS,.spectrum:lang(ko) .spectrum-Heading--sizeXXS,.spectrum:lang(zh) .spectrum-Heading--sizeXXS{color:var(
--spectrum-heading-xxs-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXXXL--light,.spectrum:lang(ko) .spectrum-Heading-sizeXXXL--light,.spectrum:lang(zh) .spectrum-Heading-sizeXXXL--light{color:var(
--spectrum-heading-xxxl-light-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXXL--light,.spectrum:lang(ko) .spectrum-Heading-sizeXXL--light,.spectrum:lang(zh) .spectrum-Heading-sizeXXL--light{color:var(
--spectrum-heading-xxl-light-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXL--light,.spectrum:lang(ko) .spectrum-Heading-sizeXL--light,.spectrum:lang(zh) .spectrum-Heading-sizeXL--light{color:var(
--spectrum-heading-xl-light-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeL--light,.spectrum:lang(ko) .spectrum-Heading-sizeL--light,.spectrum:lang(zh) .spectrum-Heading-sizeL--light{color:var(
--spectrum-heading-l-light-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXXXL--heavy,.spectrum:lang(ko) .spectrum-Heading-sizeXXXL--heavy,.spectrum:lang(zh) .spectrum-Heading-sizeXXXL--heavy{color:var(
--spectrum-heading-xxxl-heavy-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXXL--heavy,.spectrum:lang(ko) .spectrum-Heading-sizeXXL--heavy,.spectrum:lang(zh) .spectrum-Heading-sizeXXL--heavy{color:var(
--spectrum-heading-xxl-heavy-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXL--heavy,.spectrum:lang(ko) .spectrum-Heading-sizeXL--heavy,.spectrum:lang(zh) .spectrum-Heading-sizeXL--heavy{color:var(
--spectrum-heading-xl-heavy-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeL--heavy,.spectrum:lang(ko) .spectrum-Heading-sizeL--heavy,.spectrum:lang(zh) .spectrum-Heading-sizeL--heavy{color:var(
--spectrum-heading-l-heavy-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXXXL--heading,.spectrum:lang(ko) .spectrum-Heading-sizeXXXL--heading,.spectrum:lang(zh) .spectrum-Heading-sizeXXXL--heading{color:var(
--spectrum-heading-xxxl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXXL--heading,.spectrum:lang(ko) .spectrum-Heading-sizeXXL--heading,.spectrum:lang(zh) .spectrum-Heading-sizeXXL--heading{color:var(
--spectrum-heading-xxl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeXL--heading,.spectrum:lang(ko) .spectrum-Heading-sizeXL--heading,.spectrum:lang(zh) .spectrum-Heading-sizeXL--heading{color:var(
--spectrum-heading-xl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Heading-sizeL--heading,.spectrum:lang(ko) .spectrum-Heading-sizeL--heading,.spectrum:lang(zh) .spectrum-Heading-sizeL--heading{color:var(
--spectrum-heading-l-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Detail--sizeXL,.spectrum:lang(ko) .spectrum-Detail--sizeXL,.spectrum:lang(zh) .spectrum-Detail--sizeXL{color:var(
--spectrum-detail-xl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Detail--sizeL,.spectrum:lang(ko) .spectrum-Detail--sizeL,.spectrum:lang(zh) .spectrum-Detail--sizeL{color:var(
--spectrum-detail-l-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Detail--sizeM,.spectrum:lang(ko) .spectrum-Detail--sizeM,.spectrum:lang(zh) .spectrum-Detail--sizeM{color:var(
--spectrum-detail-m-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Detail--sizeS,.spectrum:lang(ko) .spectrum-Detail--sizeS,.spectrum:lang(zh) .spectrum-Detail--sizeS{color:var(
--spectrum-detail-s-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum:lang(ja) .spectrum-Code--sizeXL,.spectrum:lang(ko) .spectrum-Code--sizeXL,.spectrum:lang(zh) .spectrum-Code--sizeXL{color:var(--spectrum-code-xl-text-color,var(--spectrum-alias-text-color))}.spectrum:lang(ja) .spectrum-Code--sizeL,.spectrum:lang(ko) .spectrum-Code--sizeL,.spectrum:lang(zh) .spectrum-Code--sizeL{color:var(--spectrum-code-l-text-color,var(--spectrum-alias-text-color))}.spectrum:lang(ja) .spectrum-Code--sizeM,.spectrum:lang(ko) .spectrum-Code--sizeM,.spectrum:lang(zh) .spectrum-Code--sizeM{color:var(--spectrum-code-m-text-color,var(--spectrum-alias-text-color))}.spectrum:lang(ja) .spectrum-Code--sizeS,.spectrum:lang(ko) .spectrum-Code--sizeS,.spectrum:lang(zh) .spectrum-Code--sizeS{color:var(--spectrum-code-s-text-color,var(--spectrum-alias-text-color))}.spectrum:lang(ja) .spectrum-Code--sizeXS,.spectrum:lang(ko) .spectrum-Code--sizeXS,.spectrum:lang(zh) .spectrum-Code--sizeXS{color:var(--spectrum-code-xs-text-color,var(--spectrum-alias-text-color))}
`;var js=[yr,xr,p`
.spectrum-Heading--sizeXXXL{font-size:var(
--spectrum-heading-xxxl-text-size,var(--spectrum-alias-heading-xxxl-text-size)
);font-style:var(
--spectrum-heading-xxxl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-xxxl-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-xxxl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-heading-xxxl-text-line-height,var(--spectrum-alias-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-xxxl-text-transform,none)}.spectrum-Heading--sizeXXL{font-size:var(
--spectrum-heading-xxl-text-size,var(--spectrum-alias-heading-xxl-text-size)
);font-style:var(
--spectrum-heading-xxl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-xxl-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-xxl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-heading-xxl-text-line-height,var(--spectrum-alias-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-xxl-text-transform,none)}.spectrum-Heading--sizeXL{font-size:var(
--spectrum-heading-xl-text-size,var(--spectrum-alias-heading-xl-text-size)
);font-style:var(
--spectrum-heading-xl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-xl-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-xl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-heading-xl-text-line-height,var(--spectrum-alias-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-xl-text-transform,none)}.spectrum-Heading--sizeL{font-size:var(
--spectrum-heading-l-text-size,var(--spectrum-alias-heading-l-text-size)
);font-style:var(
--spectrum-heading-l-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-l-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-l-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-heading-l-text-line-height,var(--spectrum-alias-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-l-text-transform,none)}.spectrum-Heading--sizeM{font-size:var(
--spectrum-heading-m-text-size,var(--spectrum-alias-heading-m-text-size)
);font-style:var(
--spectrum-heading-m-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-m-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-m-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-heading-m-text-line-height,var(--spectrum-alias-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-m-text-transform,none)}.spectrum-Heading--sizeS{font-size:var(
--spectrum-heading-s-text-size,var(--spectrum-alias-heading-s-text-size)
);font-style:var(
--spectrum-heading-s-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-s-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-s-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-heading-s-text-line-height,var(--spectrum-alias-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-s-text-transform,none)}.spectrum-Heading--sizeXS{font-size:var(
--spectrum-heading-xs-text-size,var(--spectrum-alias-heading-xs-text-size)
);font-style:var(
--spectrum-heading-xs-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-xs-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-xs-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-heading-xs-text-line-height,var(--spectrum-alias-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-xs-text-transform,none)}.spectrum-Heading--sizeXXS{font-size:var(
--spectrum-heading-xxs-text-size,var(--spectrum-alias-heading-xxs-text-size)
);font-style:var(
--spectrum-heading-xxs-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-heading-xxs-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
);letter-spacing:var(
--spectrum-heading-xxs-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-heading-xxs-text-line-height,var(--spectrum-alias-heading-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-heading-xxs-text-transform,none)}.spectrum-Heading{font-family:var(
--spectrum-heading-m-text-font-family,var(--spectrum-alias-body-text-font-family)
);font-weight:var(
--spectrum-heading-m-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular)
)}.spectrum-Heading .spectrum-Heading-emphasized,.spectrum-Heading em{font-style:var(
--spectrum-heading-m-emphasized-text-font-style,var(--spectrum-global-font-style-italic)
)}.spectrum-Heading .spectrum-Heading-strong,.spectrum-Heading strong{font-weight:var(
--spectrum-heading-m-strong-text-font-weight,var(--spectrum-alias-heading-text-font-weight-regular-strong)
)}.spectrum-Heading--serif{font-family:var(
--spectrum-body-m-serif-text-font-family,var(--spectrum-alias-serif-text-font-family)
)}.spectrum-Heading--heavy{font-weight:var(
--spectrum-heading-m-heavy-text-font-weight,var(--spectrum-alias-heading-text-font-weight-heavy)
)}.spectrum-Heading--heavy .spectrum-Heading-emphasized,.spectrum-Heading--heavy em{font-style:var(
--spectrum-heading-m-heavy-emphasized-text-font-style,var(--spectrum-global-font-style-italic)
)}.spectrum-Heading--heavy .spectrum-Heading-strong,.spectrum-Heading--heavy strong{font-weight:var(
--spectrum-heading-m-heavy-strong-text-font-weight,var(--spectrum-alias-heading-text-font-weight-heavy-strong)
)}.spectrum-Heading--light{font-weight:var(
--spectrum-heading-m-light-emphasized-text-font-weight,var(--spectrum-alias-heading-text-font-weight-light)
)}.spectrum-Heading--light .spectrum-Heading-emphasized,.spectrum-Heading--light em{font-style:var(
--spectrum-heading-m-light-emphasized-text-font-style,var(--spectrum-global-font-style-italic)
)}.spectrum-Heading--light .spectrum-Heading-strong,.spectrum-Heading--light strong{font-weight:var(
--spectrum-heading-m-light-strong-text-font-weight,var(--spectrum-alias-heading-text-font-weight-light-strong)
)}.spectrum-Typography .spectrum-Heading--sizeXXXL{margin-bottom:var(
--spectrum-heading-xxxl-margin-bottom,var(--spectrum-global-dimension-size-125)
);margin-top:var(
--spectrum-heading-xxxl-margin-top,var(--spectrum-alias-heading-xxxl-margin-top)
)}.spectrum-Typography .spectrum-Heading--sizeXXL{margin-bottom:var(
--spectrum-heading-xxl-margin-bottom,var(--spectrum-global-dimension-size-115)
);margin-top:var(
--spectrum-heading-xxl-margin-top,var(--spectrum-alias-heading-xxl-margin-top)
)}.spectrum-Typography .spectrum-Heading--sizeXL{margin-bottom:var(
--spectrum-heading-xl-margin-bottom,var(--spectrum-global-dimension-size-100)
);margin-top:var(
--spectrum-heading-xl-margin-top,var(--spectrum-alias-heading-xl-margin-top)
)}.spectrum-Typography .spectrum-Heading--sizeL{margin-bottom:var(
--spectrum-heading-l-margin-bottom,var(--spectrum-global-dimension-size-85)
);margin-top:var(
--spectrum-heading-l-margin-top,var(--spectrum-alias-heading-l-margin-top)
)}.spectrum-Typography .spectrum-Heading--sizeM{margin-bottom:var(
--spectrum-heading-m-margin-bottom,var(--spectrum-global-dimension-size-75)
);margin-top:var(
--spectrum-heading-m-margin-top,var(--spectrum-alias-heading-m-margin-top)
)}.spectrum-Typography .spectrum-Heading--sizeS{margin-bottom:var(
--spectrum-heading-s-margin-bottom,var(--spectrum-global-dimension-size-65)
);margin-top:var(
--spectrum-heading-s-margin-top,var(--spectrum-alias-heading-s-margin-top)
)}.spectrum-Typography .spectrum-Heading--sizeXS{margin-bottom:var(
--spectrum-heading-xs-margin-bottom,var(--spectrum-global-dimension-size-50)
);margin-top:var(
--spectrum-heading-xs-margin-top,var(--spectrum-alias-heading-xs-margin-top)
)}.spectrum-Typography .spectrum-Heading--sizeXXS{margin-bottom:var(
--spectrum-heading-xxs-margin-bottom,var(--spectrum-global-dimension-size-40)
);margin-top:var(
--spectrum-heading-xxs-margin-top,var(--spectrum-alias-heading-xxs-margin-top)
)}.spectrum-Heading--sizeXXXL{color:var(
--spectrum-heading-xxxl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading--sizeXXL{color:var(
--spectrum-heading-xxl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading--sizeXL{color:var(
--spectrum-heading-xl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading--sizeL{color:var(
--spectrum-heading-l-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading--sizeM{color:var(
--spectrum-heading-m-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading--sizeS{color:var(
--spectrum-heading-s-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading--sizeXS{color:var(
--spectrum-heading-xs-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading--sizeXXS{color:var(
--spectrum-heading-xxs-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXXXL--light{color:var(
--spectrum-heading-xxxl-light-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXXL--light{color:var(
--spectrum-heading-xxl-light-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXL--light{color:var(
--spectrum-heading-xl-light-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeL--light{color:var(
--spectrum-heading-l-light-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXXXL--heavy{color:var(
--spectrum-heading-xxxl-heavy-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXXL--heavy{color:var(
--spectrum-heading-xxl-heavy-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXL--heavy{color:var(
--spectrum-heading-xl-heavy-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeL--heavy{color:var(
--spectrum-heading-l-heavy-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXXXL--heading{color:var(
--spectrum-heading-xxxl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXXL--heading{color:var(
--spectrum-heading-xxl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeXL--heading{color:var(
--spectrum-heading-xl-text-color,var(--spectrum-alias-heading-text-color)
)}.spectrum-Heading-sizeL--heading{color:var(
--spectrum-heading-l-text-color,var(--spectrum-alias-heading-text-color)
)}
`],qs=[yr,xr,p`
.spectrum-Body--sizeXXXL{font-size:var(
--spectrum-body-xxxl-text-size,var(--spectrum-global-dimension-font-size-600)
);font-style:var(
--spectrum-body-xxxl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-xxxl-text-font-weight,var(--spectrum-alias-body-text-font-weight)
);letter-spacing:var(
--spectrum-body-xxxl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-body-xxxl-text-line-height,var(--spectrum-alias-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-xxxl-text-transform,none)}.spectrum-Body--sizeXXL{font-size:var(
--spectrum-body-xxl-text-size,var(--spectrum-global-dimension-font-size-500)
);font-style:var(
--spectrum-body-xxl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-xxl-text-font-weight,var(--spectrum-alias-body-text-font-weight)
);letter-spacing:var(
--spectrum-body-xxl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-body-xxl-text-line-height,var(--spectrum-alias-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-xxl-text-transform,none)}.spectrum-Body--sizeXL{font-size:var(
--spectrum-body-xl-text-size,var(--spectrum-global-dimension-font-size-400)
);font-style:var(
--spectrum-body-xl-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-xl-text-font-weight,var(--spectrum-alias-body-text-font-weight)
);letter-spacing:var(
--spectrum-body-xl-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-body-xl-text-line-height,var(--spectrum-alias-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-xl-text-transform,none)}.spectrum-Body--sizeL{font-size:var(
--spectrum-body-l-text-size,var(--spectrum-global-dimension-font-size-300)
);font-style:var(
--spectrum-body-l-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-l-text-font-weight,var(--spectrum-alias-body-text-font-weight)
);letter-spacing:var(
--spectrum-body-l-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-body-l-text-line-height,var(--spectrum-alias-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-l-text-transform,none)}.spectrum-Body--sizeM{font-size:var(
--spectrum-body-m-text-size,var(--spectrum-global-dimension-font-size-200)
);font-style:var(
--spectrum-body-m-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-m-text-font-weight,var(--spectrum-alias-body-text-font-weight)
);letter-spacing:var(
--spectrum-body-m-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-body-m-text-line-height,var(--spectrum-alias-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-m-text-transform,none)}.spectrum-Body--sizeS{font-size:var(
--spectrum-body-s-text-size,var(--spectrum-global-dimension-font-size-100)
);font-style:var(
--spectrum-body-s-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-s-text-font-weight,var(--spectrum-alias-body-text-font-weight)
);letter-spacing:var(
--spectrum-body-s-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-body-s-text-line-height,var(--spectrum-alias-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-s-text-transform,none)}.spectrum-Body--sizeXS{font-size:var(
--spectrum-body-xs-text-size,var(--spectrum-global-dimension-font-size-75)
);font-style:var(
--spectrum-body-xs-text-font-style,var(--spectrum-global-font-style-regular)
);font-weight:var(
--spectrum-body-xs-text-font-weight,var(--spectrum-alias-body-text-font-weight)
);letter-spacing:var(
--spectrum-body-xs-text-letter-spacing,var(--spectrum-global-font-letter-spacing-none)
);line-height:var(
--spectrum-body-xs-text-line-height,var(--spectrum-alias-body-text-line-height)
);margin-bottom:0;margin-top:0;text-transform:var(--spectrum-body-xs-text-transform,none)}.spectrum-Body{font-family:var(
--spectrum-body-m-text-font-family,var(--spectrum-alias-body-text-font-family)
)}.spectrum-Body .spectrum-Body-strong,.spectrum-Body strong{font-weight:var(
--spectrum-body-m-strong-text-font-weight,var(--spectrum-global-font-weight-bold)
)}.spectrum-Body .spectrum-Body-emphasized,.spectrum-Body em{font-style:var(
--spectrum-body-m-emphasized-text-font-style,var(--spectrum-global-font-style-italic)
)}.spectrum-Body--serif{font-family:var(
--spectrum-body-m-serif-text-font-family,var(--spectrum-alias-serif-text-font-family)
)}.spectrum-Typography .spectrum-Body--sizeXXXL{margin-bottom:var(
--spectrum-body-xxxl-margin-bottom,var(--spectrum-global-dimension-size-400)
);margin-top:var(--spectrum-body-xxxl-margin-top,0)}.spectrum-Typography .spectrum-Body--sizeXXL{margin-bottom:var(
--spectrum-body-xxl-margin-bottom,var(--spectrum-global-dimension-size-300)
);margin-top:var(--spectrum-body-xxl-margin-top,0)}.spectrum-Typography .spectrum-Body--sizeXL{margin-bottom:var(
--spectrum-body-xl-margin-bottom,var(--spectrum-global-dimension-size-200)
);margin-top:var(--spectrum-body-xl-margin-top,0)}.spectrum-Typography .spectrum-Body--sizeL{margin-bottom:var(
--spectrum-body-l-margin-bottom,var(--spectrum-global-dimension-size-160)
);margin-top:var(--spectrum-body-l-margin-top,0)}.spectrum-Typography .spectrum-Body--sizeM{margin-bottom:var(
--spectrum-body-m-margin-bottom,var(--spectrum-global-dimension-size-150)
);margin-top:var(--spectrum-body-m-margin-top,0)}.spectrum-Typography .spectrum-Body--sizeS{margin-bottom:var(
--spectrum-body-s-margin-bottom,var(--spectrum-global-dimension-size-125)
);margin-top:var(--spectrum-body-s-margin-top,0)}.spectrum-Typography .spectrum-Body--sizeXS{margin-bottom:var(
--spectrum-body-xs-margin-bottom,var(--spectrum-global-dimension-size-115)
);margin-top:var(--spectrum-body-xs-margin-top,0)}.spectrum-Body--sizeXXXL{color:var(
--spectrum-body-xxxl-text-color,var(--spectrum-alias-text-color)
)}.spectrum-Body--sizeXXL{color:var(
--spectrum-body-xxl-text-color,var(--spectrum-alias-text-color)
)}.spectrum-Body--sizeXL{color:var(--spectrum-body-xl-text-color,var(--spectrum-alias-text-color))}.spectrum-Body--sizeL{color:var(--spectrum-body-l-text-color,var(--spectrum-alias-text-color))}.spectrum-Body--sizeM{color:var(--spectrum-body-m-text-color,var(--spectrum-alias-text-color))}.spectrum-Body--sizeS{color:var(--spectrum-body-s-text-color,var(--spectrum-alias-text-color))}.spectrum-Body--sizeXS{color:var(--spectrum-body-xs-text-color,var(--spectrum-alias-text-color))}
`],Ms=Object.defineProperty,Bs=Object.getOwnPropertyDescriptor,kr=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?Bs(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&Ms(t,e,s),s};class qt extends L{constructor(){super(...arguments),this.heading="",this.description=""}static get styles(){return[js,qs,Hs]}render(){return u`
            <div id="illustration"><slot></slot></div>
            <h2
                id="heading"
                class="spectrum-Heading spectrum-Heading--sizeL spectrum-Heading--light"
            >
                <slot name="heading">${this.heading}</slot>
            </h2>
            <div id="description" class="spectrum-Body spectrum-Body--sizeS">
                <slot name="description">${this.description}</slot>
            </div>
        `}}qt.is="sp-illustrated-message",kr([l()],qt.prototype,"heading",2),kr([l()],qt.prototype,"description",2),customElements.define("sp-illustrated-message",qt),customElements.define("sp-icon-search",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Search"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M33.173 30.215 25.4 22.443a12.826 12.826 0 1 0-2.957 2.957l7.772 7.772a2.1 2.1 0 0 0 2.958-2.958ZM6 15a9 9 0 1 1 9 9 9 9 0 0 1-9-9Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}}),customElements.define("sp-button",kt);var Ds=p`
:host{--spectrum-buttongroup-spacing-horizontal:var(--spectrum-spacing-300);--spectrum-buttongroup-spacing-vertical:var(--spectrum-spacing-300)}:host([size=s]){--spectrum-buttongroup-spacing-horizontal:var(--spectrum-spacing-200);--spectrum-buttongroup-spacing-vertical:var(--spectrum-spacing-200)}:host([size=m]){--spectrum-buttongroup-spacing-horizontal:var(--spectrum-spacing-300);--spectrum-buttongroup-spacing-vertical:var(--spectrum-spacing-300)}:host([size=l]){--spectrum-buttongroup-spacing-horizontal:var(--spectrum-spacing-300);--spectrum-buttongroup-spacing-vertical:var(--spectrum-spacing-300)}:host([size=xl]){--spectrum-buttongroup-spacing-horizontal:var(--spectrum-spacing-300);--spectrum-buttongroup-spacing-vertical:var(--spectrum-spacing-300)}:host{display:flex;flex-wrap:wrap;gap:var(
--mod-buttongroup-spacing-horizontal,var(--spectrum-buttongroup-spacing-horizontal)
)}::slotted(*){flex-shrink:0}:host([vertical]){display:inline-flex;flex-direction:column;gap:var(
--mod-buttongroup-spacing-vertical,var(--spectrum-buttongroup-spacing-vertical)
)}:host([vertical]) ::slotted(sp-action-button){--spectrum-actionbutton-label-flex-grow:1}:host([dir=ltr][vertical]) ::slotted(sp-action-button){--spectrum-actionbutton-label-text-align:left}:host([dir=rtl][vertical]) ::slotted(sp-action-button){--spectrum-actionbutton-label-text-align:right}
`,Ps=Object.defineProperty,Os=Object.getOwnPropertyDescriptor;class wr extends R(L){constructor(){super(...arguments),this.vertical=!1}static get styles(){return[Ds]}handleSlotchange({target:t}){t.assignedElements().forEach(e=>{e.size=this.size})}render(){return u`
            <slot @slotchange=${this.handleSlotchange}></slot>
        `}}((r,t,e,o)=>{for(var a,s=o>1?void 0:o?Os(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);o&&s&&Ps(t,e,s)})([l({type:Boolean,reflect:!0})],wr.prototype,"vertical",2),customElements.define("sp-button-group",wr);var Us=p`
:host{fill:currentColor;color:inherit;display:inline-block;pointer-events:none}:host(:not(:root)){overflow:hidden}@media (forced-colors:active){:host{forced-color-adjust:auto}}:host{--spectrum-icon-size-s:var(
--spectrum-alias-workflow-icon-size-s,var(--spectrum-global-dimension-size-200)
);--spectrum-icon-size-m:var(
--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225)
);--spectrum-icon-size-l:var(--spectrum-alias-workflow-icon-size-l);--spectrum-icon-size-xl:var(
--spectrum-alias-workflow-icon-size-xl,var(--spectrum-global-dimension-size-275)
);--spectrum-icon-size-xxl:var(--spectrum-global-dimension-size-400)}:host([size=s]){height:var(--spectrum-icon-size-s);width:var(--spectrum-icon-size-s)}:host([size=m]){height:var(--spectrum-icon-size-m);width:var(--spectrum-icon-size-m)}:host([size=l]){height:var(--spectrum-icon-size-l);width:var(--spectrum-icon-size-l)}:host([size=xl]){height:var(--spectrum-icon-size-xl);width:var(--spectrum-icon-size-xl)}:host([size=xxl]){height:var(--spectrum-icon-size-xxl);width:var(--spectrum-icon-size-xxl)}:host{height:var(
--spectrum-icon-tshirt-size-height,var(
--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)
)
);width:var(
--spectrum-icon-tshirt-size-width,var(
--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)
)
)}#container{height:100%}::slotted(*),img,svg{color:inherit;height:100%;vertical-align:top;width:100%}@media (forced-colors:active){::slotted(*),img,svg{forced-color-adjust:auto}}
`,Xs=Object.defineProperty,Rs=Object.getOwnPropertyDescriptor,zr=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?Rs(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&Xs(t,e,s),s};class ge extends L{static get styles(){return[Us]}render(){return u`
            <slot></slot>
        `}}zr([l()],ge.prototype,"label",2),zr([l({reflect:!0})],ge.prototype,"size",2);var Ns=Object.defineProperty,Fs=Object.getOwnPropertyDescriptor,be=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?Fs(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&Ns(t,e,s),s};class Mt extends ge{constructor(){super(...arguments),this.iconsetListener=t=>{if(!this.name)return;const e=this.parseIcon(this.name);t.detail.name===e.iconset&&(this.updateIconPromise=this.updateIcon())}}connectedCallback(){super.connectedCallback(),window.addEventListener("sp-iconset-added",this.iconsetListener)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sp-iconset-added",this.iconsetListener)}firstUpdated(){this.updateIconPromise=this.updateIcon()}attributeChangedCallback(t,e,o){super.attributeChangedCallback(t,e,o),this.updateIconPromise=this.updateIcon()}render(){return this.name?u`
                <div id="container"></div>
            `:this.src?u`
                <img src="${this.src}" alt=${b(this.label)} />
            `:super.render()}async updateIcon(){if(this.updateIconPromise&&await this.updateIconPromise,!this.name)return Promise.resolve();const t=this.parseIcon(this.name),e=M.getInstance().getIconset(t.iconset);return e&&this.iconContainer?(this.iconContainer.innerHTML="",e.applyIconToElement(this.iconContainer,t.icon,this.size||"",this.label?this.label:"")):Promise.resolve()}parseIcon(t){const e=t.split(":");let o="default",a=t;return e.length>1&&(o=e[0],a=e[1]),{iconset:o,icon:a}}async getUpdateComplete(){const t=await super.getUpdateComplete();return await this.updateIconPromise,t}}be([l()],Mt.prototype,"src",2),be([l()],Mt.prototype,"name",2),be([X("#container")],Mt.prototype,"iconContainer",2),customElements.define("sp-icon",Mt),customElements.define("sp-icon-chevron100",class extends B{render(){return tt(u),(({width:r=24,height:t=24,title:e="Chevron100"}={})=>J`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 10 10"
    aria-hidden="true"
    role="img"
    fill="currentColor"
    aria-label=${e}
    width=${r}
    height=${t}
  >
    <path
      d="M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z"
    />
  </svg>`)()}});var Gs=p`
.spectrum-UIIcon-ChevronDown100,.spectrum-UIIcon-ChevronDown200,.spectrum-UIIcon-ChevronDown300,.spectrum-UIIcon-ChevronDown400,.spectrum-UIIcon-ChevronDown500,.spectrum-UIIcon-ChevronDown75{transform:rotate(90deg)}.spectrum-UIIcon-ChevronLeft100,.spectrum-UIIcon-ChevronLeft200,.spectrum-UIIcon-ChevronLeft300,.spectrum-UIIcon-ChevronLeft400,.spectrum-UIIcon-ChevronLeft500,.spectrum-UIIcon-ChevronLeft75{transform:rotate(180deg)}.spectrum-UIIcon-ChevronUp100,.spectrum-UIIcon-ChevronUp200,.spectrum-UIIcon-ChevronUp300,.spectrum-UIIcon-ChevronUp400,.spectrum-UIIcon-ChevronUp500,.spectrum-UIIcon-ChevronUp75{transform:rotate(270deg)}.spectrum-UIIcon-ChevronDown75,.spectrum-UIIcon-ChevronLeft75,.spectrum-UIIcon-ChevronRight75,.spectrum-UIIcon-ChevronUp75{height:var(--spectrum-alias-ui-icon-chevron-size-75);width:var(--spectrum-alias-ui-icon-chevron-size-75)}.spectrum-UIIcon-ChevronDown100,.spectrum-UIIcon-ChevronLeft100,.spectrum-UIIcon-ChevronRight100,.spectrum-UIIcon-ChevronUp100{height:var(--spectrum-alias-ui-icon-chevron-size-100);width:var(--spectrum-alias-ui-icon-chevron-size-100)}.spectrum-UIIcon-ChevronDown200,.spectrum-UIIcon-ChevronLeft200,.spectrum-UIIcon-ChevronRight200,.spectrum-UIIcon-ChevronUp200{height:var(--spectrum-alias-ui-icon-chevron-size-200);width:var(--spectrum-alias-ui-icon-chevron-size-200)}.spectrum-UIIcon-ChevronDown300,.spectrum-UIIcon-ChevronLeft300,.spectrum-UIIcon-ChevronRight300,.spectrum-UIIcon-ChevronUp300{height:var(--spectrum-alias-ui-icon-chevron-size-300);width:var(--spectrum-alias-ui-icon-chevron-size-300)}.spectrum-UIIcon-ChevronDown400,.spectrum-UIIcon-ChevronLeft400,.spectrum-UIIcon-ChevronRight400,.spectrum-UIIcon-ChevronUp400{height:var(--spectrum-alias-ui-icon-chevron-size-400);width:var(--spectrum-alias-ui-icon-chevron-size-400)}.spectrum-UIIcon-ChevronDown500,.spectrum-UIIcon-ChevronLeft500,.spectrum-UIIcon-ChevronRight500,.spectrum-UIIcon-ChevronUp500{height:var(--spectrum-alias-ui-icon-chevron-size-500);width:var(--spectrum-alias-ui-icon-chevron-size-500)}
`;class Vs extends Event{constructor({root:t}){super("sp-overlay-close",{bubbles:!0,composed:!0}),this.root=t}}var Ks=p`
.checkmark{align-self:flex-start;display:none;opacity:1;transform:scale(1)}:host([dir=ltr]) .checkmark{padding-left:var(
--spectrum-listitem-texticon-icon-gap
)}:host([dir=rtl]) .checkmark{padding-right:var(
--spectrum-listitem-texticon-icon-gap
)}.checkmark{flex-grow:0;margin-top:calc(var(--spectrum-listitem-texticon-ui-icon-margin-top) - var(--spectrum-listitem-texticon-padding-y) + 1px)}:host([dir=ltr]) .chevron{padding-left:var(
--spectrum-listitem-texticon-icon-gap
)}:host([dir=rtl]) .chevron{padding-right:var(
--spectrum-listitem-texticon-icon-gap
)}.chevron{flex-grow:0;margin-top:calc(var(--spectrum-listitem-texticon-ui-icon-margin-top) - var(--spectrum-listitem-texticon-padding-y) + 1px)}:host([dir=ltr]){border-left:var(--spectrum-listitem-texticon-focus-indicator-size) solid transparent}:host([dir=rtl]){border-right:var(--spectrum-listitem-texticon-focus-indicator-size) solid transparent}:host{align-items:center;box-sizing:border-box;cursor:pointer;display:flex;font-size:var(--spectrum-listitem-texticon-text-size);font-style:normal;font-weight:var(--spectrum-listitem-texticon-text-font-weight);margin:0;min-height:var(--spectrum-listitem-texticon-height);padding:var(--spectrum-listitem-texticon-padding-y) var(--spectrum-listitem-texticon-padding-right) var(--spectrum-listitem-texticon-padding-y) var(--spectrum-listitem-texticon-padding-left);position:relative;text-decoration:none}:host(:focus){outline:none}:host([dir=ltr][selected]){padding-right:calc(var(--spectrum-listitem-texticon-padding-right) - var(
--spectrum-popover-border-size,
var(--spectrum-alias-border-size-thin)
))}:host([dir=rtl][selected]){padding-left:calc(var(--spectrum-listitem-texticon-padding-right) - var(
--spectrum-popover-border-size,
var(--spectrum-alias-border-size-thin)
))}:host([selected]) .checkmark{display:block}.icon,::slotted([slot=icon]){align-self:flex-start;flex-shrink:0}:host([dir=ltr]) .icon+#label,:host([dir=ltr]) slot[name=icon]+#label{margin-left:var(
--spectrum-listitem-texticon-icon-gap
)}:host([dir=rtl]) .icon+#label,:host([dir=rtl]) slot[name=icon]+#label{margin-right:var(
--spectrum-listitem-texticon-icon-gap
)}.icon+#label,slot[name=icon]+#label{width:calc(100% - var(--spectrum-listitem-texticon-ui-icon-width) - var(--spectrum-listitem-texticon-icon-gap) - var(--spectrum-listitem-textthumbnail-padding-left) - var(
--spectrum-alias-workflow-icon-size-m,
var(--spectrum-global-dimension-size-225)
))}:host([no-wrap]) #label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host([dir=ltr]) .checkmark,:host([dir=ltr]) .chevron{padding-left:var(
--spectrum-listitem-texticon-icon-gap
)}:host([dir=rtl]) .checkmark,:host([dir=rtl]) .chevron{padding-right:var(
--spectrum-listitem-texticon-icon-gap
)}:host([dir=rtl]) .chevron{transform:matrix(-1,0,0,1,0,0)}:host{background-color:var(
--spectrum-listitem-m-texticon-background-color,var(--spectrum-alias-background-color-transparent)
);color:var(
--spectrum-listitem-m-texticon-text-color,var(--spectrum-alias-component-text-color-default)
)}:host([dir=ltr].focus-visible),:host([dir=ltr][focused]){border-left-color:var(
--spectrum-listitem-m-texticon-focus-indicator-color,var(--spectrum-alias-border-color-key-focus)
)}:host([dir=ltr].focus-visible),:host([dir=ltr][focused]){border-left-color:var(
--spectrum-listitem-m-texticon-focus-indicator-color,var(--spectrum-alias-border-color-key-focus)
)}:host([dir=ltr]:focus-visible),:host([dir=ltr][focused]){border-left-color:var(
--spectrum-listitem-m-texticon-focus-indicator-color,var(--spectrum-alias-border-color-key-focus)
)}:host([dir=rtl].focus-visible),:host([dir=rtl][focused]){border-right-color:var(
--spectrum-listitem-m-texticon-focus-indicator-color,var(--spectrum-alias-border-color-key-focus)
)}:host([dir=rtl].focus-visible),:host([dir=rtl][focused]){border-right-color:var(
--spectrum-listitem-m-texticon-focus-indicator-color,var(--spectrum-alias-border-color-key-focus)
)}:host([dir=rtl]:focus-visible),:host([dir=rtl][focused]){border-right-color:var(
--spectrum-listitem-m-texticon-focus-indicator-color,var(--spectrum-alias-border-color-key-focus)
)}:host(.focus-visible),:host([focused]){background-color:var(
--spectrum-listitem-m-texticon-background-color-key-focus,var(--spectrum-alias-background-color-hover-overlay)
);color:var(
--spectrum-listitem-m-texticon-text-color-key-focus,var(--spectrum-alias-component-text-color-key-focus)
)}:host(.focus-visible),:host([focused]){background-color:var(
--spectrum-listitem-m-texticon-background-color-key-focus,var(--spectrum-alias-background-color-hover-overlay)
);color:var(
--spectrum-listitem-m-texticon-text-color-key-focus,var(--spectrum-alias-component-text-color-key-focus)
)}:host(:focus-visible),:host([focused]){background-color:var(
--spectrum-listitem-m-texticon-background-color-key-focus,var(--spectrum-alias-background-color-hover-overlay)
);color:var(
--spectrum-listitem-m-texticon-text-color-key-focus,var(--spectrum-alias-component-text-color-key-focus)
)}:host(.is-highlighted),:host(.is-open),:host(:focus),:host(:hover){background-color:var(
--spectrum-listitem-m-texticon-background-color-hover,var(--spectrum-alias-background-color-hover-overlay)
);color:var(
--spectrum-listitem-m-texticon-text-color-hover,var(--spectrum-alias-component-text-color-hover)
)}:host([selected]){color:var(
--spectrum-listitem-m-texticon-text-color-selected,var(--spectrum-alias-component-text-color-default)
)}:host([selected]) .checkmark{color:var(
--spectrum-listitem-m-texticon-ui-icon-color-selected,var(--spectrum-alias-icon-color-selected)
)}:host(:active),:host([active]){background-color:var(
--spectrum-listitem-m-texticon-background-color-down,var(--spectrum-alias-background-color-hover-overlay)
)}:host([disabled]){background-color:var(
--spectrum-listitem-m-texticon-background-color-disabled,var(--spectrum-alias-background-color-transparent)
);background-image:none;color:var(
--spectrum-listitem-m-texticon-text-color-disabled,var(--spectrum-alias-component-text-color-disabled)
);cursor:default}@media (forced-colors:active){:host{--spectrum-listheading-text-color:ButtonText;--spectrum-listitem-m-texticon-background-color:ButtonFace;--spectrum-listitem-m-texticon-background-color-disabled:ButtonFace;--spectrum-listitem-m-texticon-background-color-down:ButtonFace;--spectrum-listitem-m-texticon-background-color-hover:Highlight;--spectrum-listitem-m-texticon-background-color-key-focus:Highlight;--spectrum-listitem-m-texticon-focus-indicator-color:Highlight;--spectrum-listitem-m-texticon-text-color:ButtonText;--spectrum-listitem-m-texticon-text-color-disabled:GrayText;--spectrum-listitem-m-texticon-text-color-hover:HighlightText;--spectrum-listitem-m-texticon-text-color-key-focus:HighlightText;--spectrum-listitem-m-texticon-text-color-selected:ButtonText;--spectrum-listitem-m-texticon-ui-icon-color-selected:Highlight;forced-color-adjust:none}:host(:not([disabled]).focus-visible),:host(:not([disabled]).is-highlighted),:host(:not([disabled]).is-open),:host(:not([disabled]):focus),:host(:not([disabled]):hover),:host(:not([disabled])[focused]){background-color:var(
--spectrum-listitem-m-texticon-background-color-key-focus,var(--spectrum-alias-background-color-hover-overlay)
);color:var(
--spectrum-listitem-m-texticon-text-color-key-focus,var(--spectrum-alias-component-text-color-key-focus)
)}:host(:not([disabled]).is-highlighted),:host(:not([disabled]).is-open),:host(:not([disabled]):focus),:host(:not([disabled]):focus-visible),:host(:not([disabled]):hover),:host(:not([disabled])[focused]){background-color:var(
--spectrum-listitem-m-texticon-background-color-key-focus,var(--spectrum-alias-background-color-hover-overlay)
);color:var(
--spectrum-listitem-m-texticon-text-color-key-focus,var(--spectrum-alias-component-text-color-key-focus)
)}:host(:not([disabled]).focus-visible[selected]) .checkmark,:host(:not([disabled]).is-highlighted[selected]) .checkmark,:host(:not([disabled]).is-open[selected]) .checkmark,:host(:not([disabled]):focus[selected]) .checkmark,:host(:not([disabled]):hover[selected]) .checkmark,:host(:not([disabled])[focused][selected]) .checkmark{color:HighlightText}:host(:not([disabled]).is-highlighted[selected]) .checkmark,:host(:not([disabled]).is-open[selected]) .checkmark,:host(:not([disabled]):focus-visible[selected]) .checkmark,:host(:not([disabled]):focus[selected]) .checkmark,:host(:not([disabled]):hover[selected]) .checkmark,:host(:not([disabled])[focused][selected]) .checkmark{color:HighlightText}}#label{flex:1 1 auto;-webkit-hyphens:auto;hyphens:auto;line-height:var(--spectrum-listitem-texticon-label-line-height);overflow-wrap:break-word;width:calc(100% - var(--spectrum-listitem-texticon-ui-icon-width) - var(--spectrum-listitem-texticon-icon-gap))}.spectrum-Menu-itemLabel--wrapping{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host([hidden]){display:none}:host([disabled]){pointer-events:none}#button{inset:0;position:absolute}::slotted([slot=value]){align-self:start}:host([dir=ltr]) ::slotted([slot=value]){margin-left:var(--spectrum-listitem-texticon-icon-gap)}:host([dir=rtl]) ::slotted([slot=value]){margin-right:var(--spectrum-listitem-texticon-icon-gap)}:host([dir=ltr]) [icon-only]::slotted(:last-of-type){margin-right:auto}:host([dir=rtl]) [icon-only]::slotted(:last-of-type){margin-left:auto}:host([dir=ltr]) ::slotted([slot=icon]){margin-right:var(--spectrum-listitem-texticon-icon-gap)}:host([dir=rtl]) ::slotted([slot=icon]){margin-left:var(--spectrum-listitem-texticon-icon-gap)}:host([dir=rtl]) slot[name=icon]+#label{margin-right:0}:host([dir=ltr]) slot[name=icon]+#label{margin-left:0}:host([dir=rtl]) .chevron{padding-left:var(--spectrum-listitem-texticon-icon-gap);padding-right:0}
`,Zs=p`
.spectrum-UIIcon-Checkmark50{height:var(--spectrum-alias-ui-icon-checkmark-size-50);width:var(--spectrum-alias-ui-icon-checkmark-size-50)}.spectrum-UIIcon-Checkmark75{height:var(--spectrum-alias-ui-icon-checkmark-size-75);width:var(--spectrum-alias-ui-icon-checkmark-size-75)}.spectrum-UIIcon-Checkmark100{height:var(--spectrum-alias-ui-icon-checkmark-size-100);width:var(--spectrum-alias-ui-icon-checkmark-size-100)}.spectrum-UIIcon-Checkmark200{height:var(--spectrum-alias-ui-icon-checkmark-size-200);width:var(--spectrum-alias-ui-icon-checkmark-size-200)}.spectrum-UIIcon-Checkmark300{height:var(--spectrum-alias-ui-icon-checkmark-size-300);width:var(--spectrum-alias-ui-icon-checkmark-size-300)}.spectrum-UIIcon-Checkmark400{height:var(--spectrum-alias-ui-icon-checkmark-size-400);width:var(--spectrum-alias-ui-icon-checkmark-size-400)}.spectrum-UIIcon-Checkmark500{height:var(--spectrum-alias-ui-icon-checkmark-size-500);width:var(--spectrum-alias-ui-icon-checkmark-size-500)}.spectrum-UIIcon-Checkmark600{height:var(--spectrum-alias-ui-icon-checkmark-size-600);width:var(--spectrum-alias-ui-icon-checkmark-size-600)}
`,Ws=Object.defineProperty,Qs=Object.getOwnPropertyDescriptor,Z=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?Qs(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&Ws(t,e,s),s};class Ys extends Event{constructor(){super("sp-menu-item-removed",{bubbles:!0,composed:!0}),this.focused=!1}get item(){return this._item}reset(t){this._item=t}}class Js extends Event{constructor(){super("sp-menu-item-added-or-updated",{bubbles:!0,composed:!0})}set focusRoot(t){this.item.menuData.focusRoot=this.item.menuData.focusRoot||t}set selectionRoot(t){this.item.menuData.selectionRoot=this.item.menuData.selectionRoot||t}get item(){return this._item}set currentAncestorWithSelects(t){this._currentAncestorWithSelects=t}get currentAncestorWithSelects(){return this._currentAncestorWithSelects}reset(t){this._item=t,this._currentAncestorWithSelects=void 0,t.menuData={focusRoot:void 0,selectionRoot:void 0}}}const Bt=new Js,Cr=new Ys,Ir=class extends re(F){constructor(){super(),this.isInSubmenu=!1,this.active=!1,this.focused=!1,this.selected=!1,this._value="",this.hasSubmenu=!1,this.noWrap=!1,this.open=!1,this.handleSubmenuChange=()=>{var r;(r=this.menuData.selectionRoot)==null||r.selectOrToggleItem(this)},this.handleSubmenuPointerenter=()=>{this.leaveTimeout&&(clearTimeout(this.leaveTimeout),delete this.leaveTimeout)},this.menuData={focusRoot:void 0,selectionRoot:void 0},this.proxyFocus=this.proxyFocus.bind(this),this.addEventListener("click",this.handleClickCapture,{capture:!0}),new tr(this,{config:{characterData:!0,childList:!0,subtree:!0},callback:()=>{this.breakItemChildrenCache()}})}static get styles(){return[Ks,Zs,Gs]}get value(){return this._value||this.itemText}set value(r){r!==this._value&&(this._value=r||"",this._value?this.setAttribute("value",this._value):this.removeAttribute("value"))}get itemText(){return this.itemChildren.content.reduce((r,t)=>r+(t.textContent||"").trim(),"")}get focusElement(){return this}get itemChildren(){var r,t;if(this._itemChildren)return this._itemChildren;const e=(r=this.shadowRoot)==null?void 0:r.querySelector('slot[name="icon"]'),o=e?e.assignedElements().map(c=>{const i=c.cloneNode(!0);return i.removeAttribute("slot"),i.classList.toggle("icon"),i}):[],a=(t=this.shadowRoot)==null?void 0:t.querySelector("slot:not([name])"),s=a?a.assignedNodes().map(c=>c.cloneNode(!0)):[];return this._itemChildren={icon:o,content:s},this._itemChildren}click(){this.disabled||this.shouldProxyClick()||super.click()}handleClickCapture(r){if(this.disabled)return r.preventDefault(),r.stopImmediatePropagation(),r.stopPropagation(),!1}proxyFocus(){this.focus()}shouldProxyClick(){let r=!1;return this.anchorElement&&(this.anchorElement.click(),r=!0),r}breakItemChildrenCache(){this._itemChildren=void 0,this.triggerUpdate()}render(){return u`
            <slot name="icon"></slot>
            <div id="label">
                <slot id="slot"></slot>
            </div>
            <slot name="value"></slot>
            ${this.selected?u`
                      <sp-icon-checkmark100
                          id="selected"
                          class="spectrum-UIIcon-Checkmark100 icon checkmark"
                      ></sp-icon-checkmark100>
                  `:u``}
            ${this.href&&this.href.length>0?super.renderAnchor({id:"button",ariaHidden:!0,className:"button anchor hidden"}):u``}
            <slot
                hidden
                name="submenu"
                @slotchange=${this.manageSubmenu}
            ></slot>
            ${this.hasSubmenu?u`
                      <sp-icon-chevron100
                          class="spectrum-UIIcon-ChevronRight100 chevron icon"
                      ></sp-icon-chevron100>
                  `:u``}
        `}manageSubmenu(r){const t=r.target.assignedElements({flatten:!0});this.hasSubmenu=this.open||!!t.length}handleRemoveActive(r){r.type==="pointerleave"&&this.hasSubmenu||this.hasSubmenu||this.open||(this.active=!1)}handlePointerdown(){this.active=!0}firstUpdated(r){super.firstUpdated(r),this.setAttribute("tabindex","-1"),this.addEventListener("pointerdown",this.handlePointerdown),this.hasAttribute("id")||(this.id="sp-menu-item-"+Ir.instanceCount++),this.addEventListener("pointerenter",this.closeOverlaysForRoot)}closeOverlaysForRoot(){if(this.open)return;const r=new Vs({root:this.menuData.focusRoot});this.dispatchEvent(r)}handleSubmenuClick(){this.openOverlay()}handlePointerenter(){if(this.leaveTimeout)return clearTimeout(this.leaveTimeout),void delete this.leaveTimeout;this.openOverlay()}handlePointerleave(){this.hasSubmenu&&this.open&&(this.leaveTimeout=setTimeout(()=>{delete this.leaveTimeout,this.closeOverlay&&this.closeOverlay()},100))}async openOverlay(){if(!this.hasSubmenu||this.open||this.disabled)return;this.open=!0,this.active=!0;const r=this.shadowRoot.querySelector('slot[name="submenu"]').assignedElements()[0];r.addEventListener("pointerenter",this.handleSubmenuPointerenter),r.addEventListener("change",this.handleSubmenuChange);const t=document.createElement("sp-popover"),e=rr([r],t,{position:"beforeend",prepareCallback:s=>{const c=s.slot;return s.tabIndex=0,s.removeAttribute("slot"),s.isSubmenu=!0,i=>{i.tabIndex=-1,i.slot=c,i.isSubmenu=!1}}}),o=de(this,"click",t,{placement:this.isLTR?"right-start":"left-start",receivesFocus:"auto",root:this.menuData.focusRoot}),a=async()=>{delete this.closeOverlay,(await o)()};this.closeOverlay=a,this.addEventListener("sp-closed",s=>{s.stopPropagation(),delete this.closeOverlay,e(),this.open=!1,this.active=!1},{once:!0}),t.addEventListener("change",a)}updateAriaSelected(){const r=this.getAttribute("role");r==="option"?this.setAttribute("aria-selected",this.selected?"true":"false"):(r==="menuitemcheckbox"||r==="menuitemradio")&&this.setAttribute("aria-checked",this.selected?"true":"false")}setRole(r){this.setAttribute("role",r),this.updateAriaSelected()}updated(r){super.updated(r),r.has("label")&&this.setAttribute("aria-label",this.label||""),r.has("active")&&(this.active?(this.addEventListener("pointerup",this.handleRemoveActive),this.addEventListener("pointerleave",this.handleRemoveActive),this.addEventListener("pointercancel",this.handleRemoveActive)):(this.removeEventListener("pointerup",this.handleRemoveActive),this.removeEventListener("pointerleave",this.handleRemoveActive),this.removeEventListener("pointercancel",this.handleRemoveActive))),this.anchorElement&&(this.anchorElement.addEventListener("focus",this.proxyFocus),this.anchorElement.tabIndex=-1),r.has("selected")&&this.updateAriaSelected(),r.has("hasSubmenu")&&(this.hasSubmenu?(this.addEventListener("click",this.handleSubmenuClick),this.addEventListener("pointerenter",this.handlePointerenter),this.addEventListener("pointerleave",this.handlePointerleave)):this.closeOverlay||(this.removeEventListener("click",this.handleSubmenuClick),this.removeEventListener("pointerenter",this.handlePointerenter),this.removeEventListener("pointerleave",this.handlePointerleave)))}connectedCallback(){super.connectedCallback(),this.isInSubmenu=!!this.closest('[slot="submenu"]'),!this.isInSubmenu&&(Bt.reset(this),this.dispatchEvent(Bt),this._parentElement=this.parentElement)}disconnectedCallback(){var r;Cr.reset(this),this.isInSubmenu||(r=this._parentElement)==null||r.dispatchEvent(Cr),this.isInSubmenu=!1,super.disconnectedCallback()}async triggerUpdate(){this.isInSubmenu||(await new Promise(r=>requestAnimationFrame(r)),Bt.reset(this),this.dispatchEvent(Bt))}};let _=Ir;_.instanceCount=0,Z([l({type:Boolean,reflect:!0})],_.prototype,"active",2),Z([l({type:Boolean,reflect:!0})],_.prototype,"focused",2),Z([l({type:Boolean,reflect:!0})],_.prototype,"selected",2),Z([l({type:String})],_.prototype,"value",1),Z([l({type:Boolean})],_.prototype,"hasSubmenu",2),Z([l({type:Boolean,reflect:!0,attribute:"no-wrap",hasChanged:()=>!1})],_.prototype,"noWrap",2),Z([X(".anchor")],_.prototype,"anchorElement",2),Z([l({type:Boolean})],_.prototype,"open",2);var ta=p`
:host{--spectrum-menu-margin-x:var(
--spectrum-global-dimension-size-40
);--spectrum-listitem-texticon-heading-text-size:var(
--spectrum-global-dimension-font-size-50
);--spectrum-listitem-texticon-heading-text-font-weight:400;--spectrum-listitem-texticon-heading-text-transform:uppercase;--spectrum-listitem-texticon-heading-letter-spacing:0.06em;--spectrum-listitem-texticon-heading-margin:var(
--spectrum-global-dimension-size-75
) 0 0 0;--spectrum-listitem-texticon-heading-padding:0 var(--spectrum-global-dimension-size-450) 0 var(--spectrum-global-dimension-size-150);--spectrum-listitem-texticon-padding-y:var(
--spectrum-global-dimension-size-85
);--spectrum-listitem-texticon-selectable-padding-right:calc(var(--spectrum-listitem-texticon-ui-icon-width) + var(--spectrum-listitem-texticon-ui-icon-gap) + var(--spectrum-listitem-texticon-padding-right) - var(
--spectrum-popover-border-size,
var(--spectrum-alias-border-size-thin)
));--spectrum-listitem-texticon-label-line-height:1.3;--spectrum-listitem-texticon-heading-line-height:var(
--spectrum-alias-body-text-line-height,var(--spectrum-global-font-line-height-medium)
)}:host{--spectrum-listitem-texticon-padding-left:var(
--spectrum-listitem-m-texticon-padding-left
);--spectrum-listitem-textthumbnail-padding-left:var(
--spectrum-listitem-m-textthumbnail-padding-left
);--spectrum-listitem-texticon-text-size:var(
--spectrum-listitem-m-texticon-text-size,var(--spectrum-global-dimension-font-size-100)
);--spectrum-listitem-texticon-text-font-weight:var(
--spectrum-listitem-m-texticon-text-font-weight,var(--spectrum-alias-body-text-font-weight)
);--spectrum-listitem-texticon-icon-gap:var(
--spectrum-listitem-m-texticon-icon-gap,var(--spectrum-global-dimension-size-100)
);--spectrum-listitem-texticon-divider-padding:var(
--spectrum-listitem-m-texticon-divider-padding,var(--spectrum-global-dimension-static-size-40)
);--spectrum-listitem-texticon-ui-icon-margin-top:var(
--spectrum-listitem-m-texticon-ui-icon-margin-top,var(--spectrum-global-dimension-size-125)
);--spectrum-listitem-texticon-ui-icon-width:var(
--spectrum-listitem-m-texticon-ui-icon-width,var(--spectrum-alias-ui-icon-checkmark-size-100)
);--spectrum-listitem-texticon-ui-icon-gap:var(
--spectrum-listitem-m-texticon-ui-icon-gap,var(--spectrum-global-dimension-size-100)
);--spectrum-listitem-texticon-padding-right:var(
--spectrum-listitem-m-texticon-padding-right,var(--spectrum-global-dimension-size-150)
);--spectrum-listitem-texticon-focus-indicator-size:var(
--spectrum-listitem-m-texticon-focus-indicator-size,var(--spectrum-alias-border-size-thick)
);--spectrum-listitem-texticon-height:var(
--spectrum-listitem-m-texticon-height,var(--spectrum-global-dimension-size-400)
)}:host{box-sizing:border-box;display:inline-block;list-style-type:none;margin-bottom:var(
--spectrum-popover-padding-y,var(--spectrum-global-dimension-size-50)
);margin-left:0;margin-right:0;margin-top:var(
--spectrum-popover-padding-y,var(--spectrum-global-dimension-size-50)
);overflow:auto;padding:0}:host([dir=ltr][selects]) ::slotted(sp-menu-item){padding-right:var(
--spectrum-listitem-texticon-selectable-padding-right
)}:host([dir=rtl][selects]) ::slotted(sp-menu-item){padding-left:var(
--spectrum-listitem-texticon-selectable-padding-right
)}:host([dir=ltr][selects]) ::slotted(sp-menu-item[selected]){padding-right:calc(var(--spectrum-listitem-texticon-padding-right) - var(
--spectrum-popover-border-size,
var(--spectrum-alias-border-size-thin)
))}:host([dir=rtl][selects]) ::slotted(sp-menu-item[selected]){padding-left:calc(var(--spectrum-listitem-texticon-padding-right) - var(
--spectrum-popover-border-size,
var(--spectrum-alias-border-size-thin)
))}::slotted(sp-menu){display:block}:host{--spectrum-listheading-text-color:var(
--spectrum-global-color-gray-700
)}:host{background-color:var(
--spectrum-listitem-m-texticon-background-color,var(--spectrum-alias-background-color-transparent)
)}:host{--spectrum-listitem-selectable-padding-right:calc(var(--spectrum-global-dimension-size-100) + var(--spectrum-icon-checkmark-medium-width) + var(--spectrum-listitem-icon-gap));display:inline-flex;flex-direction:column;width:var(--swc-menu-width)}:host(:focus){outline:none}::slotted(*){--swc-menu-width:100%;flex-shrink:0}
`,ea=Object.defineProperty,ra=Object.getOwnPropertyDescriptor,et=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?ra(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&ea(t,e,s),s};function Er(r,t){return!!t&&(r===t||r.contains(t))}class P extends L{constructor(){super(),this.isSubmenu=!1,this.label="",this.value="",this.valueSeparator=",",this.selected=[],this.selectedItems=[],this.childItemSet=new Set,this.focusedItemIndex=0,this.focusInItemIndex=0,this.selectedItemsMap=new Map,this._willUpdateItems=!1,this._notFirstUpdated=!1,this.cacheUpdated=Promise.resolve(),this.addEventListener("sp-menu-item-added-or-updated",this.onSelectableItemAddedOrUpdated),this.addEventListener("sp-menu-item-added-or-updated",this.onFocusableItemAddedOrUpdated,{capture:!0}),this.addEventListener("sp-menu-item-removed",this.removeChildItem),this.addEventListener("click",this.onClick),this.addEventListener("focusin",this.handleFocusin)}static get styles(){return[ta]}get childItems(){return this.cachedChildItems||(this.cachedChildItems=this.updateCachedMenuItems()),this.cachedChildItems}updateCachedMenuItems(){this.cachedChildItems=[];const t=this.menuSlot?this.menuSlot.assignedElements({flatten:!0}):[];for(const e of t){const o=e instanceof _?[e]:[...e.querySelectorAll("*")];for(const a of o)this.childItemSet.has(a)&&this.cachedChildItems.push(a)}return this.cachedChildItems}get childRole(){if(this.resolvedRole==="listbox")return"option";switch(this.resolvedSelects){case"single":return"menuitemradio";case"multiple":return"menuitemcheckbox";default:return"menuitem"}}get ownRole(){return"menu"}onFocusableItemAddedOrUpdated(t){var e;t.item.menuData.focusRoot&&(this.tabIndex=-1),t.focusRoot=this,this.addChildItem(t.item),this.selects==="inherit"?(this.resolvedSelects="inherit",this.resolvedRole=((e=t.currentAncestorWithSelects)==null?void 0:e.getAttribute("role"))||this.getAttribute("role")||void 0):this.selects?(this.resolvedRole=this.getAttribute("role")||void 0,this.resolvedSelects=this.selects,t.currentAncestorWithSelects=this):(this.resolvedRole=this.getAttribute("role")||void 0,this.resolvedSelects=this.resolvedRole==="none"?"ignore":"none")}onSelectableItemAddedOrUpdated(t){(this.resolvedSelects==="single"||this.resolvedSelects==="multiple"||!this.selects&&this.resolvedSelects!=="ignore")&&!t.item.menuData.selectionRoot&&(t.item.setRole(this.childRole),t.selectionRoot=this)}addChildItem(t){this.childItemSet.add(t),this.handleItemsChanged()}async removeChildItem(t){this.childItemSet.delete(t.item),this.cachedChildItems=void 0,t.item.focused&&(this.handleItemsChanged(),await this.updateComplete,this.focus())}focus({preventScroll:t}={}){if(!this.childItems.length||this.childItems.every(o=>o.disabled))return;if(this.childItems.some(o=>o.menuData.focusRoot!==this))return void super.focus({preventScroll:t});this.focusMenuItemByOffset(0),super.focus({preventScroll:t});const e=this.querySelector("[selected]");e&&!t&&e.scrollIntoView({block:"nearest"})}onClick(t){if(t.defaultPrevented)return;const e=t.composedPath().find(o=>o instanceof Element&&o.getAttribute("role")===this.childRole);e!=null&&e.href&&e.href.length?this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})):(e==null?void 0:e.menuData.selectionRoot)===this&&this.childItems.length&&(t.preventDefault(),e.hasSubmenu||e.open||(this.selectOrToggleItem(e),this.prepareToCleanUp()))}handleFocusin(t){var e;const o=Er(this,t.relatedTarget);if(o||this.childItems.some(c=>c.menuData.focusRoot!==this))return;const a=this.getRootNode().activeElement,s=((e=this.childItems[this.focusedItemIndex])==null?void 0:e.menuData.selectionRoot)||this;if((a!==s||!o)&&(s.focus({preventScroll:!0}),a&&this.focusedItemIndex===0)){const c=this.childItems.findIndex(i=>i===a);c>0&&this.focusMenuItemByOffset(c)}this.startListeningToKeyboard()}startListeningToKeyboard(){this.addEventListener("keydown",this.handleKeydown),this.addEventListener("focusout",this.handleFocusout)}handleFocusout(t){if(Er(this,t.relatedTarget))t.composedPath()[0].focused=!1;else{if(this.stopListeningToKeyboard(),t.target===this&&this.childItems.some(e=>e.menuData.focusRoot===this)){const e=this.childItems[this.focusedItemIndex];e&&(e.focused=!1)}this.removeAttribute("aria-activedescendant")}}stopListeningToKeyboard(){this.removeEventListener("keydown",this.handleKeydown),this.removeEventListener("focusout",this.handleFocusout)}async selectOrToggleItem(t){const e=this.resolvedSelects,o=new Map(this.selectedItemsMap),a=this.selected.slice(),s=this.selectedItems.slice(),c=this.value;if(this.childItems[this.focusedItemIndex].focused=!1,this.focusedItemIndex=this.childItems.indexOf(t),this.forwardFocusVisibleToItem(t),e==="multiple"){this.selectedItemsMap.has(t)?this.selectedItemsMap.delete(t):this.selectedItemsMap.set(t,!0);const i=[],n=[];this.childItemSet.forEach(m=>{m.menuData.selectionRoot===this&&this.selectedItemsMap.has(m)&&(i.push(m.value),n.push(m))}),this.selected=i,this.selectedItems=n,this.value=this.selected.join(this.valueSeparator)}else this.selectedItemsMap.clear(),this.selectedItemsMap.set(t,!0),this.value=t.value,this.selected=[t.value],this.selectedItems=[t];if(await this.updateComplete,!this.dispatchEvent(new Event("change",{cancelable:!0,bubbles:!0,composed:!0})))return this.selected=a,this.selectedItems=s,this.selectedItemsMap=o,void(this.value=c);if(e==="single"){for(const i of o.keys())i!==t&&(i.selected=!1);t.selected=!0}else e==="multiple"&&(t.selected=!t.selected)}navigateWithinMenu(t){const{code:e}=t,o=this.childItems[this.focusedItemIndex],a=e==="ArrowDown"?1:-1,s=this.focusMenuItemByOffset(a);s!==o&&(t.preventDefault(),s.scrollIntoView({block:"nearest"}))}navigateBetweenRelatedMenus(t){const e=this.isLTR&&t==="ArrowRight"||!this.isLTR&&t==="ArrowLeft",o=this.isLTR&&t==="ArrowLeft"||!this.isLTR&&t==="ArrowRight";if(e){const a=this.childItems[this.focusedItemIndex];a!=null&&a.hasSubmenu&&(this.blur(),a.openOverlay())}else o&&this.isSubmenu&&this.dispatchEvent(new Event("close",{bubbles:!0}))}handleKeydown(t){var e;const{code:o}=t;if(o!=="Tab"){if(o==="Space"){const a=this.childItems[this.focusedItemIndex];if(a!=null&&a.hasSubmenu)return this.blur(),void a.openOverlay()}o!=="Space"&&o!=="Enter"?o!=="ArrowDown"&&o!=="ArrowUp"?this.navigateBetweenRelatedMenus(o):this.navigateWithinMenu(t):(e=this.childItems[this.focusedItemIndex])==null||e.click()}else this.prepareToCleanUp()}focusMenuItemByOffset(t){const e=t||1;this.childItems[this.focusedItemIndex].focused=!1,this.focusedItemIndex=(this.childItems.length+this.focusedItemIndex+t)%this.childItems.length;let o=this.childItems[this.focusedItemIndex],a=this.childItems.length;for(;o.disabled&&a;)a-=1,this.focusedItemIndex=(this.childItems.length+this.focusedItemIndex+e)%this.childItems.length,o=this.childItems[this.focusedItemIndex];return o!=null&&o.disabled||this.forwardFocusVisibleToItem(o),o}prepareToCleanUp(){document.addEventListener("focusout",()=>{requestAnimationFrame(()=>{const t=this.childItems[this.focusedItemIndex];t&&(t.focused=!1,this.updateSelectedItemIndex())})},{once:!0})}updateSelectedItemIndex(){let t=0;const e=new Map,o=[],a=[];let s=this.childItems.length;for(;s;){s-=1;const c=this.childItems[s];c.menuData.selectionRoot===this&&(c.selected&&(t=s,e.set(c,!0),o.unshift(c.value),a.unshift(c)),s!==t&&(c.focused=!1))}a.map((c,i)=>{i>0&&(c.focused=!1)}),this.selectedItemsMap=e,this.selected=o,this.selectedItems=a,this.value=this.selected.join(this.valueSeparator),this.focusedItemIndex=t,this.focusInItemIndex=t}handleItemsChanged(){if(this.cachedChildItems=void 0,!this._willUpdateItems){let t=()=>{};this.cacheUpdated=new Promise(e=>t=e),this._willUpdateItems=!0,window.requestAnimationFrame(()=>{this.cachedChildItems===void 0&&(this.updateSelectedItemIndex(),this.updateItemFocus()),this._willUpdateItems=!1,t()})}}updateItemFocus(){if(this.childItems.length==0)return;const t=this.childItems[this.focusInItemIndex];this.getRootNode().activeElement===t.menuData.focusRoot&&this.forwardFocusVisibleToItem(t)}forwardFocusVisibleToItem(t){t.menuData.focusRoot===this&&(t.focused=this.hasVisibleFocusInTree(),this.setAttribute("aria-activedescendant",t.id),t.menuData.selectionRoot&&t.menuData.selectionRoot!==this&&t.menuData.selectionRoot.focus())}render(){return u`
            <slot></slot>
        `}firstUpdated(t){if(super.firstUpdated(t),!this.hasAttribute("tabindex")){const o=this.getAttribute("role");o==="group"?this.tabIndex=-1:o!=="none"&&(this.tabIndex=0)}const e=[new Promise(o=>requestAnimationFrame(()=>o(!0)))];[...this.children].forEach(o=>{o.localName==="sp-menu-item"&&e.push(o.updateComplete)}),this.childItemsUpdated=Promise.all(e)}updated(t){super.updated(t),t.has("selects")&&this._notFirstUpdated&&this.selectsChanged(),t.has("label")&&(this.label?this.setAttribute("aria-label",this.label):this.removeAttribute("aria-label")),this._notFirstUpdated=!0}selectsChanged(){const t=[new Promise(e=>requestAnimationFrame(()=>e(!0)))];this.childItemSet.forEach(e=>{t.push(e.triggerUpdate())}),this.childItemsUpdated=Promise.all(t)}connectedCallback(){super.connectedCallback(),this.hasAttribute("role")||this.setAttribute("role",this.ownRole),this.updateComplete.then(()=>this.updateItemFocus())}async getUpdateComplete(){const t=await super.getUpdateComplete();return await this.childItemsUpdated,await this.cacheUpdated,t}}et([l({type:String,reflect:!0})],P.prototype,"label",2),et([l({type:String,reflect:!0})],P.prototype,"selects",2),et([l({type:String})],P.prototype,"value",2),et([l({type:String,attribute:"value-separator"})],P.prototype,"valueSeparator",2),et([l({attribute:!1})],P.prototype,"selected",2),et([l({attribute:!1})],P.prototype,"selectedItems",2),et([X("slot:not([name])")],P.prototype,"menuSlot",2),customElements.define("sp-menu",P);var oa=p`
.header{color:var(--spectrum-listheading-text-color);display:block;font-size:var(--spectrum-listitem-texticon-heading-text-size);font-weight:var(--spectrum-listitem-texticon-heading-text-font-weight);letter-spacing:var(
--spectrum-listitem-texticon-heading-letter-spacing
);line-height:var(--spectrum-listitem-texticon-heading-line-height);margin:var(--spectrum-listitem-texticon-heading-margin);padding:var(--spectrum-listitem-texticon-heading-padding);text-transform:var(--spectrum-listitem-texticon-heading-text-transform)}:host{display:inline-flex;flex-direction:column;margin:0;overflow:visible}:host([dir=ltr]) .header{padding:0 var(--spectrum-global-dimension-size-450) 0 var(--spectrum-global-dimension-size-150)}:host([dir=rtl]) .header{padding:0 var(--spectrum-global-dimension-size-150) 0 var(--spectrum-global-dimension-size-450)}sp-menu{--swc-menu-width:100%}:host(:last-child) sp-menu{margin-bottom:0}:host(:first-child) .header[hidden]+sp-menu{margin-top:0}[hidden]{display:none!important}
`,sa=Object.defineProperty,aa=Object.getOwnPropertyDescriptor,Lr=(r,t,e,o)=>{for(var a,s=o>1?void 0:o?aa(t,e):t,c=r.length-1;c>=0;c--)(a=r[c])&&(s=(o?a(t,e,s):a(s))||s);return o&&s&&sa(t,e,s),s};const he=class extends P{constructor(){super(),he.instances+=1,this.headerId=`sp-menu-group-label-${he.instances}`}static get styles(){return[...super.styles,oa]}get ownRole(){switch(this.selects){case"multiple":case"single":case"inherit":return"group";default:return"menu"}}updateLabel(){const r=this.headerElements.length?this.headerElements[0]:void 0;if(r!==this.headerElement)if(this.headerElement&&this.headerElement.id===this.headerId&&this.headerElement.removeAttribute("id"),r){const t=r.id||this.headerId;r.id||(r.id=t),this.setAttribute("aria-labelledby",t)}else this.removeAttribute("aria-labelledby");this.headerElement=r}render(){return u`
            <span
                class="header"
                aria-hidden="true"
                ?hidden=${!this.headerElement}
            >
                <slot name="header" @slotchange=${this.updateLabel}></slot>
            </span>
            <sp-menu role="none">
                <slot></slot>
            </sp-menu>
        `}};let Dt=he;Dt.instances=0,Lr([Ne("header",!0)],Dt.prototype,"headerElements",2),Lr([Wt()],Dt.prototype,"headerElement",2),customElements.define("sp-menu-group",Dt);var ca=p`
:host{margin:calc(var(--spectrum-listitem-texticon-divider-padding)/2) var(--spectrum-listitem-texticon-padding-y);overflow:visible;width:auto}@media (forced-colors:active){:host{background-color:CanvasText;forced-color-adjust:none}}:host{display:block}
`,ia=p`
:host{--spectrum-divider-thickness:var(--spectrum-divider-thickness-medium);--spectrum-divider-background-color:var(
--spectrum-divider-background-color-medium
);--spectrum-divider-background-color-small:var(--spectrum-gray-300);--spectrum-divider-background-color-medium:var(--spectrum-gray-300);--spectrum-divider-background-color-large:var(--spectrum-gray-800);--spectrum-divider-background-color-small-static-white:var(
--spectrum-transparent-white-300
);--spectrum-divider-background-color-medium-static-white:var(
--spectrum-transparent-white-300
);--spectrum-divider-background-color-large-static-white:var(
--spectrum-transparent-white-800
);--spectrum-divider-background-color-small-static-black:var(
--spectrum-transparent-black-300
);--spectrum-divider-background-color-medium-static-black:var(
--spectrum-transparent-black-300
);--spectrum-divider-background-color-large-static-black:var(
--spectrum-transparent-black-800
)}:host([size=s]){--spectrum-divider-thickness:var(--spectrum-divider-thickness-small);--spectrum-divider-background-color:var(
--spectrum-divider-background-color-small
)}:host([size=m]){--spectrum-divider-thickness:var(--spectrum-divider-thickness-medium);--spectrum-divider-background-color:var(
--spectrum-divider-background-color-medium
)}:host([size=l]){--spectrum-divider-thickness:var(--spectrum-divider-thickness-large);--spectrum-divider-background-color:var(
--spectrum-divider-background-color-large
)}@media (forced-colors:active){:host{--spectrum-divider-background-color:CanvasText;--spectrum-divider-background-color-small-static-white:CanvasText;--spectrum-divider-background-color-medium-static-white:CanvasText;--spectrum-divider-background-color-large-static-white:CanvasText;--spectrum-divider-background-color-small-static-black:CanvasText;--spectrum-divider-background-color-medium-static-black:CanvasText;--spectrum-divider-background-color-large-static-black:CanvasText}}:host{background-color:var(
--mod-divider-background-color,var(--spectrum-divider-background-color)
);block-size:var(--mod-divider-thickness,var(--spectrum-divider-thickness));border:none;border-radius:var(
--mod-divider-thickness,var(--spectrum-divider-thickness)
);border-width:var(
--mod-divider-thickness,var(--spectrum-divider-thickness)
);inline-size:100%;overflow:visible}:host([static=white][size=s]){--spectrum-divider-background-color:var(
--mod-divider-background-color-small-static-white,var(--spectrum-divider-background-color-small-static-white)
)}:host([static=white][size=m]){--spectrum-divider-background-color:var(
--mod-divider-background-color-medium-static-white,var(--spectrum-divider-background-color-medium-static-white)
)}:host([static=white][size=l]){--spectrum-divider-background-color:var(
--mod-divider-background-color-large-static-white,var(--spectrum-divider-background-color-large-static-white)
)}:host([static=black][size=s]){--spectrum-divider-background-color:var(
--mod-divider-background-color-small-static-black,var(--spectrum-divider-background-color-small-static-black)
)}:host([static=black][size=m]){--spectrum-divider-background-color:var(
--mod-divider-background-color-medium-static-black,var(--spectrum-divider-background-color-medium-static-black)
)}:host([static=black][size=l]){--spectrum-divider-background-color:var(
--mod-divider-background-color-large-static-black,var(--spectrum-divider-background-color-large-static-black)
)}:host([vertical]){block-size:100%;inline-size:var(
--mod-divider-thickness,var(--spectrum-divider-thickness)
)}:host{display:block}hr{border:none;margin:0}
`;class na extends R(L,{validSizes:["s","m","l"]}){static get styles(){return[ia,ca]}firstUpdated(t){super.firstUpdated(t),this.setAttribute("role","separator")}}customElements.define("sp-menu-divider",na),customElements.define("sp-menu-item",class extends _{static get styles(){return[...super.styles,p`
        :host {
          height: 42px;
        }

        sp-icon-checkmark100 {
          padding-top: 4px;
        }
      `]}}),customElements.define("sp-icon-copy",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Copy"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <rect height="2" rx=".5" ry=".5" width="2" x="32" y="22" />
    <rect height="2" rx=".5" ry=".5" width="2" x="32" y="18" />
    <rect height="2" rx=".5" ry=".5" width="2" x="32" y="14" />
    <rect height="2" rx=".5" ry=".5" width="2" x="32" y="10" />
    <rect height="2" rx=".5" ry=".5" width="2" x="32" y="6" />
    <rect height="2" rx=".5" ry=".5" width="2" x="32" y="2" />
    <rect height="2" rx=".5" ry=".5" width="2" x="28" y="2" />
    <rect height="2" rx=".5" ry=".5" width="2" x="24" y="2" />
    <rect height="2" rx=".5" ry=".5" width="2" x="20" y="2" />
    <rect height="2" rx=".5" ry=".5" width="2" x="16" y="2" />
    <rect height="2" rx=".5" ry=".5" width="2" x="12" y="2" />
    <rect height="2" rx=".5" ry=".5" width="2" x="12" y="6" />
    <rect height="2" rx=".5" ry=".5" width="2" x="12" y="10" />
    <rect height="2" rx=".5" ry=".5" width="2" x="12" y="14" />
    <rect height="2" rx=".5" ry=".5" width="2" x="12" y="18" />
    <rect height="2" rx=".5" ry=".5" width="2" x="12" y="22" />
    <rect height="2" rx=".5" ry=".5" width="2" x="16" y="22" />
    <rect height="2" rx=".5" ry=".5" width="2" x="20" y="22" />
    <rect height="2" rx=".5" ry=".5" width="2" x="24" y="22" />
    <rect height="2" rx=".5" ry=".5" width="2" x="28" y="22" />
    <path d="M10 12H3a1 1 0 0 0-1 1v20a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1v-7H11a1 1 0 0 1-1-1Z" />
  </svg>`)({hidden:!this.label,title:this.label})}}),customElements.define("sp-icon-preview",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Preview"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M33.191 32.143 28.646 27.6a9.065 9.065 0 1 0-3.046 3.046l4.546 4.545a2.044 2.044 0 0 0 3.048 0A2.133 2.133 0 0 0 33.781 34a2.163 2.163 0 0 0-.59-1.857ZM15.412 22.98a5.568 5.568 0 1 1 5.568 5.568 5.568 5.568 0 0 1-5.568-5.568Z"
    />
    <path
      d="M33 4H3a1 1 0 0 0-1 1v26a1 1 0 0 0 1 1h11.232a11.322 11.322 0 0 1-2.068-2H4V10h28v17.777l2 1.99V5a1 1 0 0 0-1-1Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}}),customElements.define("sp-icon-view-detail",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="View Detail"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M35.191 32.143 30.646 27.6a9.066 9.066 0 1 0-3.046 3.046l4.545 4.545a2.044 2.044 0 0 0 3.048 0 2.195 2.195 0 0 0-.002-3.048ZM17.412 22.98a5.568 5.568 0 1 1 5.568 5.567 5.568 5.568 0 0 1-5.568-5.567Z"
    />
    <path
      d="M12.878 28H6V6h22v6.878a11.323 11.323 0 0 1 4 3.309V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v28a1 1 0 0 0 1 1h13.188a11.324 11.324 0 0 1-3.31-4Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}}),customElements.define("sp-icon-chevron-right",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Chevron Right"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M24 18a1.988 1.988 0 0 1-.585 1.409l-7.983 7.98a2 2 0 1 1-2.871-2.772l.049-.049L19.181 18l-6.572-6.57a2 2 0 0 1 2.773-2.87l.049.049 7.983 7.98A1.988 1.988 0 0 1 24 18Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}});const I={TOAST:"Toast",LIBRARY_LOADED:"LibraryLoaded",PLUGIN_LOADED:"PluginLoaded",PLUGIN_UNLOADED:"PluginUnloaded",PREVIEW_CONTENT:"Preview",LOCALE_SET:"LocaleSet",SEARCH_UPDATED:"SearchUpdated"},W={TOAST:"Toast",SHOW_LOADER:"ShowLoader",HIDE_LOADER:"HideLoader"};class Ar extends xt{static get styles(){return[...super.styles,p`
        #item-link {
          display: flex;
          justify-content: space-between;
          min-height: 42px;
        }

        .actions {
          display: none;
        }

        #item-link:hover .actions{
          display: flex;
        }
      `]}get hasActions(){return this.copy||this.preview||this.info}connectedCallback(){super.connectedCallback(),this.info=this.getAttribute("data-info")}onClick(){this.handleClick(),this.selected=!1}onPreview(t){t.stopPropagation(),this.dispatchEvent(new CustomEvent(I.PREVIEW_CONTENT))}render(){return u`
      <a
        target=${b(this.target)}
        download=${b(this.download)}
        rel=${b(this.rel)}
        data-level="${this.depth}"
        @click="${this.onClick}"
        id="item-link"
        aria-current=${b(this.selected&&this.href?"page":void 0)}
      >
        <slot name="icon"></slot>
        ${this.label}
        <slot></slot>
        ${this.disclosureArrow?u`<sp-icon-chevron-right slot="icon"></sp-icon-chevron-right>`:""}
        ${this.hasActions?u`
          <div class='actions'>
            ${this.info?u`
              <overlay-trigger placement="left">
                <sp-tooltip slot="hover-content" variant="info">${this.info}</sp-tooltip>
                <sp-action-button quiet tip slot="trigger">
                  <sp-icon-info slot="icon"></sp-icon-info>
                </sp-action-button>
              </overlay-trigger>
            `:""}
            ${this.preview?u`
              <sp-action-button quiet @click=${this.onPreview}>
                <sp-icon-preview slot="icon"></sp-icon-preview>
              </sp-action-button>
            `:""}
          </div>
        `:""}
      </a>
      ${this.expanded?u` <slot name="descendant"></slot> `:u``}
    `}}E(Ar,"properties",{disclosureArrow:!1,copy:!1,preview:!1,info:""}),customElements.define("sp-sidenav-item",Ar),customElements.define("sp-icon-chevron-left",class extends T{render(){return q(u),(({width:r=24,height:t=24,hidden:e=!1,title:o="Chevron Left"}={})=>j`<svg
    xmlns="http://www.w3.org/2000/svg"
    height=${t}
    viewBox="0 0 36 36"
    width=${r}
    aria-hidden=${e?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label=${o}
  >
    <path
      d="M12 18a1.988 1.988 0 0 0 .585 1.409l7.983 7.98a2 2 0 1 0 2.871-2.772l-.049-.049L16.819 18l6.572-6.57a2 2 0 0 0-2.773-2.87l-.049.049-7.983 7.98A1.988 1.988 0 0 0 12 18Z"
    />
  </svg>`)({hidden:!this.label,title:this.label})}});class la{constructor(){E(this,"listeners",[])}addEventListener(t,e){const o={type:t,callback:e};return this.listeners.push(o),o}removeEventListener(t){for(let e=0;e<this.listeners.length;e++)if(t===this.listeners[e])return void this.listeners.splice(e,1)}removeEventListeners(t){t.forEach(e=>{this.removeEventListener(e)})}dispatchEvent(t){this.listeners.slice().forEach(e=>{t.type===e.type&&e.callback.apply(this,[t])})}}class v extends la{constructor(){return super(),v._instance||(v._instance=this),v._instance}static get instance(){return v._instance||(v._instance=new v),v._instance}}async function Sr(r){const t=await fetch(r);if(!t.ok)throw new Error("unable to load library JSON");return t.json()}function Tr(){return window.libraryDev}async function ua(r,t){const{appStore:e}=r;let{libraries:o}=r;e.config=t;try{const a=await Sr(t.base),s=await async function(c){return c?Sr(c):Promise.resolve()}(t.extends);o=await async function(c,i){const n={};if(c[":type"]==="multi-sheet")for(const m of c[":names"])n[m]=c[m].data;else n.blocks=c.data;if(i)if(i[":type"]==="multi-sheet")for(const m of i[":names"])n[m]?n[m].push(...i[m].data):n[m]=i[m].data;else n.blocks=[...n.blocks||[],...i.data];return n}(a,s),e.libraries=o,v.instance.dispatchEvent(new CustomEvent(I.LIBRARY_LOADED))}catch(a){v.instance.dispatchEvent(new CustomEvent(W.TOAST,{detail:{variant:"negative",message:r.appStore.localeDict.errorLoadingLibraryJSON}})),console.error("Unable to load library",a)}}E(v,"_instance",void 0);const ma={initialized:!1,activePlugin:void 0,activePluginPath:void 0,searchQuery:"",libraries:[],config:{},localeDict:{}};class h{static init(){h.appStore=function(t={},e="store"){function o(a,s,c){const i=new CustomEvent(s,{bubbles:!0,cancelable:!0,detail:c});return v.instance.dispatchEvent(i)}return new Proxy(t,function a(s,c){return{get:(i,n)=>n==="_isProxy"||(typeof i[n]=="object"&&i[n]!==null&&!i[n]._isProxy&&(i[n]=new Proxy(i[n],a(s,c))),i[n]),set:(i,n,m)=>(i[n]===m||(i[n]=m,o(0,n,c)),!0),deleteProperty:(i,n)=>(delete i[n],o(0,n,c),!0)}}(e,t))}(ma,"app"),h.appStore.webRoot=Tr()?"./src/":h.host}}async function $r(r){const{appStore:t}=r;t.activePlugin=void 0,t.pluginData=void 0,t.activePluginPath=void 0,t.activePluginDecorate=void 0,v.instance.dispatchEvent(new CustomEvent(I.PLUGIN_UNLOADED))}E(h,"host","https://www.hlx.live/tools/sidekick/library"),E(h,"appStore",void 0),E(h,"libraries",void 0);class ve extends ${connectedCallback(){super.connectedCallback(),v.instance.addEventListener(I.PLUGIN_LOADED,()=>{if(h.appStore.activePlugin){const{title:t,searchEnabled:e}=h.appStore.activePlugin;this.headerTitle=t,e&&(this.searchEnabled=!0),this._pluginActive=!0}}),v.instance.addEventListener(I.PLUGIN_UNLOADED,()=>{this.headerTitle=h.appStore.localeDict.appTitle,this._pluginActive=!1,this.searchEnabled=!1,this._searchActivated=!1;const t=this.renderRoot.querySelector(".title");t==null||t.classList.remove("search-active"),this.renderRoot.querySelector("sp-search").value=""}),v.instance.addEventListener(I.LOCALE_SET,()=>{this.headerTitle=h.appStore.localeDict.appTitle})}onBack(){$r(h)}activateSearch(){const t=this.renderRoot.querySelector(".title");this._searchActivated=!this._searchActivated,this._searchActivated?t==null||t.classList.add("search-active"):t==null||t.classList.remove("search-active");const e=this.renderRoot.querySelector("sp-search");e==null||e.focus()}onSearch(t){h.appStore.searchQuery=t.target.value,v.instance.dispatchEvent(new CustomEvent(I.SEARCH_UPDATED))}render(){return u`<div class="search">
      <div>
        ${this._pluginActive?u`
              <sp-action-button quiet @click=${this.onBack} id="back-button">
                <sp-icon-chevron-left slot="icon"></sp-icon-chevron-left>
              </sp-action-button>
              `:u`
              <div class="logo-container">
                <sp-icon
                  label="adobe logo"
                  size="xxl"
                  src="data:image/svg+xml;base64,PHN2ZyBpZD0iQWRvYmVFeHBlcmllbmNlQ2xvdWQiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgdmlld0JveD0iLTUgLTUgMjUwIDI0NCIgd2lkdGg9IjI1MCIgaGVpZ2h0PSIyNDQiCiAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCBoZWlnaHQ9IjIzNCIgcng9IjQyLjUiIHdpZHRoPSIyNDAiIGZpbGw9IiNmYTBmMDAiLz4KICA8cGF0aCBkPSJNMTg2LjYxNyAxNzUuOTVoLTI4LjUwNmE2LjI0MyA2LjI0MyAwIDAgMS01Ljg0Ny0zLjc2OWwtMzAuOTQ3LTcyLjM1OWExLjM2NCAxLjM2NCAwIDAgMC0yLjYxMS0uMDM0TDk5LjQyIDE0NS43MzFhMS42MzUgMS42MzUgMCAwIDAgMS41MDYgMi4yNjloMjEuMmEzLjI3IDMuMjcgMCAwIDEgMy4wMSAxLjk5NGw5LjI4MSAyMC42NTVhMy44MTIgMy44MTIgMCAwIDEtMy41MDcgNS4zMDFINTMuNzM0YTMuNTE4IDMuNTE4IDAgMCAxLTMuMjEzLTQuOTA0bDQ5LjA5LTExNi45MDJBNi42MzkgNi42MzkgMCAwIDEgMTA1Ljg0MyA1MGgyOC4zMTRhNi42MjggNi42MjggMCAwIDEgNi4yMzIgNC4xNDRsNDkuNDMgMTE2LjkwMmEzLjUxNyAzLjUxNyAwIDAgMS0zLjIwMiA0LjkwNHoiIGRhdGEtbmFtZT0iMjU2IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg=="
                ></sp-icon>
              </div>
            `}
      </div>
      <div class="title">
        <span>${this.headerTitle}</span>
        <sp-search
          @input=${this.onSearch}
          @submit=${t=>t.preventDefault()}
        ></sp-search>
      </div>
      <div>
        ${this._pluginActive&&this.searchEnabled?u`
          <sp-action-button id="search-button" quiet toggles @click=${this.activateSearch}>
            <sp-icon-search slot="icon"></sp-icon-search>
          </sp-action-button>`:""}
      </div>
    </div>`}}E(ve,"properties",{_searchActivated:{type:Boolean},_pluginActive:{type:Boolean},headerTitle:{type:String},searchEnabled:{type:Boolean}}),E(ve,"styles",p`
    .search {
      padding: 10px 5px;
      display: grid;
      grid-template-columns: 38px 1fr 38px;
      gap: 10px;
    }

    .search > div {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .search .title sp-search {
      display: none;
      width: 100%;
    }

    .search .title.search-active sp-search {
      display: block;
      width: 100%;
    }

    .search .title.search-active > span {
      display: none;
    }

    .logo-container {
      padding-left: 10px;
      height: 32px;
    }
  `),customElements.define("library-header",ve);class fe extends ${connectedCallback(){super.connectedCallback()}render(){return u`
      <div class="message-container">
        <sp-illustrated-message
        heading=${this.heading}
        description=${this.description}
        tabindex="0"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 150 103"
                width="150"
                height="103"
            >
                <path
                    d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z"
                ></path>
            </svg>
        </sp-illustrated-message>
      </div>`}}function ye(r,t,e){const o=document.createElement(r);return e&&(e instanceof HTMLElement||e instanceof SVGElement||e instanceof DocumentFragment?o.append(e):Array.isArray(e)?o.append(...e):o.insertAdjacentHTML("beforeend",e)),t&&Object.entries(t).forEach(([a,s])=>{o.setAttribute(a,s)}),o}E(fe,"properties",{heading:{type:String},description:{type:String}}),E(fe,"styles",p`
    .message-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `),customElements.define("illustrated-message",fe);const pa={blocks:Tr()?"../../src/plugins/blocks/blocks.js":`${h.host}/plugins/blocks/blocks.js`};class xe extends ${connectedCallback(){super.connectedCallback(),v.instance.addEventListener(I.LIBRARY_LOADED,()=>{this.libraries=h.appStore.libraries})}async onSelect(t){var e;const{value:o}=t.target,{config:a}=h.appStore,s=(e=a[o])!=null?e:pa[o];if(s)try{await async function(c,i,n){const{appStore:m}=c,g=await import(n);m.pluginData=m.libraries[i],m.activePluginPath=n,m.activePlugin=g.default,m.activePluginDecorate=g.decorate,v.instance.dispatchEvent(new CustomEvent(I.PLUGIN_LOADED))}(h,o,s)}catch(c){v.instance.dispatchEvent(new CustomEvent(W.TOAST,{detail:{variant:"negative",message:h.appStore.localeDict.errorLoadingPlugin}})),$r(h),console.error(`Error loading plugin ${o}: ${c.message}`)}else v.instance.dispatchEvent(new CustomEvent(W.TOAST,{detail:{variant:"negative",message:h.appStore.localeDict.unknownPlugin}}))}renderLibraries(){return this.libraries?Object.keys(this.libraries).map(t=>u`<sp-sidenav-item value=${t} disclosureArrow="true" data-testid="library-item">${function(e){return e.charAt(0).toUpperCase()+e.slice(1)}(t)}</sidenav-item>`):""}render(){return u`<div class="home">
      <sp-sidenav @click=${this.onSelect} data-testid=${this.libraries?"libraries-loaded":""}>
       ${this.renderLibraries()}
      </sp-sidenav>
    </div>`}}E(xe,"properties",{libraries:void 0}),E(xe,"styles",p`
    sp-sidenav {
      width: 100%;
    }
  `),customElements.define("library-list",xe);class da{}const ke=new WeakMap,ga=We(class extends po{render(r){return f}update(r,[t]){var e;const o=t!==this.G;return o&&this.G!==void 0&&this.ot(void 0),(o||this.rt!==this.lt)&&(this.G=t,this.ct=(e=r.options)===null||e===void 0?void 0:e.host,this.ot(this.lt=r.element)),f}ot(r){var t;if(typeof this.G=="function"){const e=(t=this.ct)!==null&&t!==void 0?t:globalThis;let o=ke.get(e);o===void 0&&(o=new WeakMap,ke.set(e,o)),o.get(this.G)!==void 0&&this.G.call(this.ct,void 0),o.set(this.G,r),r!==void 0&&this.G.call(this.ct,r)}else this.G.value=r}get rt(){var r,t,e;return typeof this.G=="function"?(t=ke.get((r=this.ct)!==null&&r!==void 0?r:globalThis))===null||t===void 0?void 0:t.get(this.G):(e=this.G)===null||e===void 0?void 0:e.value}disconnected(){this.rt===this.lt&&this.ot(void 0)}reconnected(){this.ot(this.lt)}});class _r extends ${constructor(...t){super(...t),E(this,"progressContainer",new da)}connectedCallback(){super.connectedCallback(),v.instance.addEventListener(I.PLUGIN_LOADED,()=>{const t=ye("div",{class:"plugin-root","data-testid":"plugin-root"});this.renderRoot.prepend(t),this.loadPluginStylesheet(),t.addEventListener(W.SHOW_LOADER,this.displayLoader.bind(this)),t.addEventListener(W.TOAST,this.sendToast),t.addEventListener(W.HIDE_LOADER,this.hideLoader.bind(this)),h.appStore.activePluginDecorate(t,h.appStore.pluginData)}),v.instance.addEventListener(I.PLUGIN_UNLOADED,()=>{const t=this.renderRoot.querySelector(".plugin-root");t&&(this.hideLoader(),t.remove())}),v.instance.addEventListener(I.SEARCH_UPDATED,()=>{const t=this.renderRoot.querySelector(".plugin-root");t&&(t.innerHTML="",h.appStore.activePluginDecorate(t,h.appStore.pluginData,h.appStore.searchQuery))})}loadPluginStylesheet(){const t=document.createElement("link");t.setAttribute("rel","stylesheet");const e=h.appStore.activePluginPath.replace(".js",".css");t.setAttribute("href",e),this.renderRoot.prepend(t)}displayLoader(){var t;(t=this.progressContainer.value)==null||t.classList.add("visible")}hideLoader(){var t;(t=this.progressContainer.value)==null||t.classList.remove("visible")}sendToast(t){v.instance.dispatchEvent(new CustomEvent(W.TOAST,{detail:t.detail}))}render(){return u`
      <div class="progress-container" ${ga(this.progressContainer)}>
        <sp-progress-circle indeterminate label="loading plugin"></sp-progress-circle>
      </div>
    `}}E(_r,"styles",p`
    sp-sidenav {
      width: 100%;
    }

    .progress-container {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      top: 0;
      align-items: center;
      justify-content: center;
      display: none;
    }

    .progress-container.visible {
      display: flex;
    }

    .plugin-root {
      height: 100%;
      overflow-y: auto;
    }
  `),customElements.define("plugin-renderer",_r);class we extends ${async loadLocaleDict(t){const e={},o=`${h.appStore.webRoot}/locales/${t}/messages.json`;try{const a=await(await fetch(o)).json();Object.keys(a).forEach(s=>{e[s]=a[s].message})}catch(a){console.error(`failed to fetch dictionary from ${o}`)}h.appStore.localeDict=e,v.instance.dispatchEvent(new CustomEvent(I.LOCALE_SET))}isValidConfig(t){if(t!=null&&t.base)return!0;const{searchParams:e}=new URL(window.location.href),o={};for(const[a,s]of e.entries())o[a]=s;return o.base?(this.config=o,!0):(console.error("Missing base configuration"),!1)}async connectedCallback(){if(super.connectedCallback(),this.getTheme(),h.init(),window.matchMedia("(prefers-color-scheme: dark)").addListener(o=>{this.theme=o.matches?"dark":"light"}),v.instance.addEventListener(I.TOAST,o=>{var a,s;const c=this.renderRoot.querySelector(".toast-container"),i=ye("sp-toast",{open:!0,variant:(a=o.detail.variant)!=null?a:"positive",timeout:200});i.textContent=(s=o.detail.message)!=null?s:"Done",c.append(i),i.addEventListener("close",()=>{c==null||c.removeChild(i)}),h.appStore.libraries.length===0&&this.renderIllustratedMessage()}),v.instance.addEventListener(I.LOCALE_SET,()=>{this.requestUpdate(),this.configured||this.renderIllustratedMessage()}),this.configured=this.isValidConfig(this.config),this.loadLocaleDict("en"),!this.configured)return;await ua(h,this.config);const t=this.renderRoot.querySelector("library-list"),e=this.renderRoot.querySelector("plugin-renderer");v.instance.addEventListener(I.PLUGIN_LOADED,()=>{t==null||t.classList.add("inset"),e==null||e.classList.add("inset")}),v.instance.addEventListener(I.PLUGIN_UNLOADED,()=>{t==null||t.classList.remove("inset"),e==null||e.classList.remove("inset")})}renderIllustratedMessage(){var t;const{invalidConfiguration:e,invalidConfigurationDescription:o}=h.appStore.localeDict,a=ye("illustrated-message",{heading:e,description:o});(t=this.renderRoot.querySelector(".container"))==null||t.append(a)}getTheme(){this.theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}render(){return u`
      <sp-theme theme="spectrum" color=${this.theme} scale="medium">
        <main>
          <library-header></library-header>
          <sp-divider size="s"></sp-divider>
          <div class="container">
            ${this.configured?u`
              <library-list></library-list>
              <plugin-renderer></plugin-renderer>            
            `:""}
          </div>
          <div class="toast-container"></div>
        </main>
      </sp-theme>
    `}}E(we,"properties",{theme:void 0}),E(we,"styles",p`
    * {
      box-sizing: border-box;
    }

    main {
      background-color: var(--spectrum-global-color-gray-100);
      color: var(--spectrum-global-color-gray-800);
      height: 100%;
      max-width: 360px;
      height: 364px;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    main .container {
      position: relative;
      height: calc(100% - 52px);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .search {
      padding: 10px 10px;
    }

    .search sp-search {
      width: 100%;
    }

    library-list {
      width: 100%;
      padding: 5px;
      padding-top: 0;
      transition: transform 0.2s ease-in-out;
      position: absolute;
    }

    library-list.inset {
      transform: translateX(-360px);
    }

    plugin-renderer {
      transform: translateX(360px);
      list-style: none;
      padding: 0;
      margin: 0;
      position: absolute;
      inset: 0;
      transition: transform 0.2s ease-in-out;
      visibility: hidden;
    }

    plugin-renderer.inset {
      transform: translateX(0);
      visibility: visible;
    }

    .toast-container {
      display: flex;
      justify-content: center;
    }

    sp-toast {
      position: absolute;
      width: 90%;
      bottom: 10px;
    }
  `),customElements.define("sidekick-library",we);export{W as PLUGIN_EVENTS,L as S,l as e,Fe as f,p as i,b as l,rr as r,u as x};
//# sourceMappingURL=index.js.map

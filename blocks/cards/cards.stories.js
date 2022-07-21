import { Template } from '../../.storybook/template.js';
import decorate from './cards.js';
// eslint-disable-next-line no-unused-vars
import style from './cards.css';

export default {
  title: 'Cards',
  parameters: {
    docs: {
      description: {
        component: 'Cards are lists of (optional) images or icons, and descriptive text. They are used to display information about a product, service, or event.',
      },
    },
  },
};

export const Three = Template.bind({ decorate, style });
Three.args = {
  inner: `<div class="cards">
    <div>
      <div>
        <p>
          <picture>
            <source type="image/webp" srcset="http://localhost:3000/media_102865949ac0b99cb9d73fe618ef550baa6736c1c.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)" />
            <source type="image/webp" srcset="http://localhost:3000/media_102865949ac0b99cb9d73fe618ef550baa6736c1c.png?width=750&amp;format=webply&amp;optimize=medium" />
            <source type="image/png" srcset="http://localhost:3000/media_102865949ac0b99cb9d73fe618ef550baa6736c1c.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)" />
            <img loading="lazy" alt="" type="image/png" src="http://localhost:3000/media_102865949ac0b99cb9d73fe618ef550baa6736c1c.png?width=750&amp;format=png&amp;optimize=medium" width="1104" height="576" />
          </picture>
        </p>
        <h3 id="launch-faster">Launch faster</h3>
        <p>There is no reason launching a new site should take months. Use Helix to shave off the cruft of legacy platforms and launch new sites in days or weeks, not months.</p>
        <p></p>
      </div>
      <div>
        <p>
          <picture>
            <source type="image/webp" srcset="http://localhost:3000/media_19c6083921baecadc2b3e9bbfeef786934a3997ba.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)" />
            <source type="image/webp" srcset="http://localhost:3000/media_19c6083921baecadc2b3e9bbfeef786934a3997ba.png?width=750&amp;format=webply&amp;optimize=medium" />
            <source type="image/png" srcset="http://localhost:3000/media_19c6083921baecadc2b3e9bbfeef786934a3997ba.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)"/>
            <img loading="lazy" alt="" type="image/png" src="http://localhost:3000/media_19c6083921baecadc2b3e9bbfeef786934a3997ba.png?width=750&amp;format=png&amp;optimize=medium" width="1102" height="574"/>
          </picture>
        </p>
        <h3 id="fastest-pages-on-the-web">Fastest Pages on the Web</h3>
        <p>There are millions of slow sites on the web. Yours does not have to be one of them. Helix delivers every page at lightning speed, to every customer, on any device, anywhere in the world.</p>
        <p></p>
        <p></p>
      </div>
      <div>
        <p>
          <picture>
            <source type="image/webp" srcset="http://localhost:3000/media_17e5bea57c976d30ae9c77e8cb0b5863cc5882f81.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)"/>
            <source type="image/webp" srcset="http://localhost:3000/media_17e5bea57c976d30ae9c77e8cb0b5863cc5882f81.png?width=750&amp;format=webply&amp;optimize=medium"/>
            <source type="image/png" srcset="http://localhost:3000/media_17e5bea57c976d30ae9c77e8cb0b5863cc5882f81.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)"/>
            <img loading="lazy" alt="" type="image/png" src="http://localhost:3000/media_17e5bea57c976d30ae9c77e8cb0b5863cc5882f81.png?width=750&amp;format=png&amp;optimize=medium" width="1104" height="574"/>
          </picture>
        </p>
        <h3 id="faster-publishing">Faster Publishing</h3>
        <p>Unshackle your authors from the burden of slow and complex content management system user interfaces. Let them create and publish content in seconds using tools they already know and love.</p>
        <p></p>
      </div>
    </div>
  </div>`,
};
Three.storyName = 'Three Cards';

export const Two = Template.bind({ decorate, style });
Two.args = {
  inner: `<div class="cards">
    <div>
      <div>
        <p>
          <picture>
            <source type="image/webp" srcset="http://localhost:3000/media_102865949ac0b99cb9d73fe618ef550baa6736c1c.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)" />
            <source type="image/webp" srcset="http://localhost:3000/media_102865949ac0b99cb9d73fe618ef550baa6736c1c.png?width=750&amp;format=webply&amp;optimize=medium" />
            <source type="image/png" srcset="http://localhost:3000/media_102865949ac0b99cb9d73fe618ef550baa6736c1c.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)" />
            <img loading="lazy" alt="" type="image/png" src="http://localhost:3000/media_102865949ac0b99cb9d73fe618ef550baa6736c1c.png?width=750&amp;format=png&amp;optimize=medium" width="1104" height="576" />
          </picture>
        </p>
        <h3 id="launch-faster">Launch faster</h3>
        <p>There is no reason launching a new site should take months. Use Helix to shave off the cruft of legacy platforms and launch new sites in days or weeks, not months.</p>
        <p></p>
      </div>
      <div>
        <p>
          <picture>
            <source type="image/webp" srcset="http://localhost:3000/media_19c6083921baecadc2b3e9bbfeef786934a3997ba.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)" />
            <source type="image/webp" srcset="http://localhost:3000/media_19c6083921baecadc2b3e9bbfeef786934a3997ba.png?width=750&amp;format=webply&amp;optimize=medium" />
            <source type="image/png" srcset="http://localhost:3000/media_19c6083921baecadc2b3e9bbfeef786934a3997ba.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)"/>
            <img loading="lazy" alt="" type="image/png" src="http://localhost:3000/media_19c6083921baecadc2b3e9bbfeef786934a3997ba.png?width=750&amp;format=png&amp;optimize=medium" width="1102" height="574"/>
          </picture>
        </p>
        <h3 id="fastest-pages-on-the-web">Fastest Pages on the Web</h3>
        <p>There are millions of slow sites on the web. Yours does not have to be one of them. Helix delivers every page at lightning speed, to every customer, on any device, anywhere in the world.</p>
        <p></p>
        <p></p>
      </div>
    </div>
  </div>`,
};
Two.storyName = 'Two Cards';
Two.parameters = {
  docs: {
    description: {
      story: 'As you add more or fewer cards, the number of columns will change.',
    },
  },
};

export const Url = Template.bind({ decorate, style });
Url.args = {
  url: '/home',
  selector: '.cards',
  index: 1,
};
Url.storyName = 'From Helix Home Page';
Url.parameters = {
  docs: {
    description: {
      story: 'Content can be loaded from a URL.',
    },
  },
};

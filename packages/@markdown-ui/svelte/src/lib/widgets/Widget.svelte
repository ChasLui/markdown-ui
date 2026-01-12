<svelte:options
  customElement={{
    tag: 'markdown-ui-widget',
    shadow: 'none',            // use 'none' if you want light-DOM
    props: {
      id: {               // the prop you asked for
        type: 'String',        // treat incoming attribute as plain text
        attribute: 'id',  // <markdown-ui-widget content="…">
        reflect: true          // update the attribute if we change it
      },
      content: {               // the prop you asked for
        type: 'String',        // treat incoming attribute as plain text
        attribute: 'content',  // <markdown-ui-widget content="…">
        reflect: true          // update the attribute if we change it
      }
    }
  }}
/>

<script lang="ts">
  import * as widgets from './index.js';

  let { id, content } = $props();

  // Type locking: track the first valid widget type we see to prevent flickering
  let lockedType: string | null = null;

  // Parse content and apply type locking
  function parseContent(content: string): any {
    try {
      const decoded = JSON.parse(decodeURIComponent(content));

      // If we have a valid type and no locked type yet, lock it
      if (decoded.type && decoded.type !== 'incomplete' && !lockedType) {
        lockedType = decoded.type;
      }

      // If we have a locked type but the new parse shows incomplete,
      // keep using the locked type (prevents flickering)
      if (lockedType && decoded.type === 'incomplete') {
        return { ...decoded, type: lockedType, _streaming: true };
      }

      return decoded;
    } catch (e) {
      // If parsing fails but we have a locked type, return a streaming placeholder
      if (lockedType) {
        return { type: lockedType, _streaming: true, _pending: true };
      }
      return { type: "incomplete" };
    }
  }

  // Use $derived to reactively parse content
  let parsed: any = $derived(parseContent(content));

  let Cmp = $derived(widgets[parsed.type as keyof typeof widgets]);

  function dispatch(detail: any) {
    try {
      const host = $host();
      if (host) {
        host.dispatchEvent(
          new CustomEvent('widget-event', {
            detail: detail,
            bubbles: true,
            composed: true   // let it cross the shadow-root boundary
          })
        );
      }
    } catch (error) {
      console.warn('Failed to dispatch widget event:', error);
    }
	}
</script>

<div class="widget" class:streaming={parsed._streaming}>
  {#if Cmp}
    <Cmp {...parsed} onchange={(value: any) => dispatch({id: id, value: value})}/>
  {:else}
    <span style="color:red">Unknown widget "{parsed.type}"</span>
  {/if}
</div>

<style>
  .widget.streaming {
    /* Subtle visual indicator that content is still streaming */
    opacity: 0.95;
  }
</style>

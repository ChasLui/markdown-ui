<script lang="ts">
  // Component for when widget is still streaming/loading
  // This is shown when we can't determine the widget type yet
</script>

<div class="incomplete-widget">
  <div class="loading-skeleton">
    <div class="skeleton-line"></div>
    <div class="skeleton-line short"></div>
  </div>
  <span class="loading-text">Parsing widget</span>
</div>

<style>
  .incomplete-widget {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(90deg, #f8f9fa 0%, #f1f3f4 50%, #f8f9fa 100%);
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    color: #666;
    min-height: 60px;
  }

  .loading-skeleton {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    width: 100%;
  }

  .skeleton-line.short {
    width: 60%;
  }

  .loading-text {
    font-size: 12px;
    opacity: 0.6;
    text-align: center;
  }

  .loading-text::after {
    content: '';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
  }
</style>
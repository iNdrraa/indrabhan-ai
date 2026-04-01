import re

with open('gallery.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The grid starts at line 158: <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
# and ends right before <!-- Decorative Intersection Line -->
start_marker = '    <!-- Projects Bento Grid -->\n    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">'
end_marker = '    <!-- Decorative Intersection Line -->'

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker) + len('    <!-- Projects Bento Grid -->\n')
    end_idx = content.find(end_marker)

    new_html = """    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="gallery-grid">
      <!-- Projects will be injected here via JavaScript -->
    </div>
    <script>
      async function loadGalleryProjects() {
        try {
          const response = await fetch('projects.json');
          const allProjects = await response.json();
          const container = document.getElementById('gallery-grid');

          const themeMap = [
            { border: 'hover:border-primary/30', textClass: 'text-primary', tagBg: 'bg-surface-container-highest', tagBorder: 'border-primary/20', hoverClass: 'hover:text-primary-container' },
            { border: 'hover:border-secondary/30', textClass: 'text-secondary', tagBg: 'bg-secondary-container/20', tagBorder: 'border-secondary/20', hoverClass: 'hover:text-secondary-dim' },
            { border: 'hover:border-tertiary/30 lg:col-span-1', textClass: 'text-tertiary', tagBg: 'bg-tertiary-container/10', tagBorder: 'border-tertiary/20', hoverClass: 'hover:text-tertiary-dim' },
            { border: 'hover:border-primary/30 md:col-span-2', textClass: 'text-primary', tagBg: 'bg-surface-container-highest', tagBorder: 'border-primary/20', hoverClass: 'hover:text-primary-container', isLarge: true },
            { border: 'hover:border-white/20', textClass: 'text-white', tagTextClass: 'text-on-surface-variant', tagBg: 'bg-surface-container-highest', tagBorder: 'border-outline-variant/30', hoverClass: 'hover:text-primary', catClass: 'text-zinc-500' },
            { border: 'hover:border-error/30', textClass: 'text-error', tagBg: 'bg-error-container/20', tagBorder: 'border-error/20', hoverClass: 'hover:text-error-dim' }
          ];

          allProjects.forEach((project, index) => {
            const theme = themeMap[index % themeMap.length];
            const tagText = theme.tagTextClass || theme.textClass;
            const tagsHtml = (project.tags?.gallery || []).map(tag => 
              `<span class="px-2 py-1 text-[10px] font-label uppercase tracking-wider ${theme.tagBg} ${tagText} border ${theme.tagBorder} rounded-full">${tag}</span>`
            ).join('');

            let cardHtml = '';
            if (project.galleryLayout === 'large') {
              const metricsHtml = (project.metricsList || []).map(m => 
                `<li class="flex items-center gap-2 text-xs font-label text-on-surface/80">
                  <span class="material-symbols-outlined text-primary text-sm">check_circle</span> ${m}
                </li>`
              ).join('');

              cardHtml = `
              <div class="glass-card group relative p-6 rounded-xl border border-outline-variant/10 ${theme.border} transition-all duration-500 hover:-translate-y-2">
                <div class="grid md:grid-cols-2 gap-8 items-center">
                  <div class="aspect-square md:aspect-video overflow-hidden rounded-lg bg-surface-container-lowest">
                    <img alt="${project.title}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" data-alt="${project.imageAlt?.gallery || ''}" src="${project.images?.gallery || ''}" />
                  </div>
                  <div>
                    <div class="flex flex-wrap gap-2 mb-4">${tagsHtml}</div>
                    <h3 class="font-headline text-2xl font-bold mb-4 lowercase tracking-tight">${project.galleryTitle || project.title}</h3>
                    <p class="text-on-surface-variant text-sm font-body leading-relaxed mb-6">${project.galleryDescription || project.description}</p>
                    <ul class="space-y-2 mb-8">${metricsHtml}</ul>
                    <button class="w-full py-3 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors font-label text-xs uppercase tracking-widest">View Full Case Study</button>
                  </div>
                </div>
              </div>`;
            } else {
              const catColor = theme.catClass || theme.textClass;
              cardHtml = `
              <div class="glass-card group relative p-6 rounded-xl border border-outline-variant/10 ${theme.border} transition-all duration-500 hover:-translate-y-2">
                <div class="aspect-video mb-6 overflow-hidden rounded-lg bg-surface-container-lowest">
                  <img alt="${project.title}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" data-alt="${project.imageAlt?.gallery || ''}" src="${project.images?.gallery || ''}" />
                </div>
                <div class="flex flex-wrap gap-2 mb-4">${tagsHtml}</div>
                <h3 class="font-headline text-xl font-bold mb-3 lowercase tracking-tight">${project.galleryTitle || project.title}</h3>
                <p class="text-on-surface-variant text-sm font-body leading-relaxed mb-6">${project.galleryDescription || project.description}</p>
                <div class="flex justify-between items-center pt-4 border-t border-white/5">
                  <span class="text-xs font-label ${catColor} uppercase tracking-widest">${project.category?.gallery || ''}</span>
                  <button class="${theme.textClass} ${theme.hoverClass} transition-colors">
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>`;
            }
            container.insertAdjacentHTML('beforeend', cardHtml);
          });
        } catch (error) {
          console.error('Error loading gallery projects:', error);
        }
      }
      document.addEventListener('DOMContentLoaded', loadGalleryProjects);
    </script>
"""

    with open('gallery.html', 'w', encoding='utf-8') as f:
        f.write(content[:start_idx] + new_html + content[end_idx:])
    print("gallery.html updated successfully!")
else:
    print("Could not find markers in gallery.html")


import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto lg:h-[800px]"'
end_marker = '        </div>\n    </section>\n    <!-- Why Hire Me -->'

if start_marker not in content or end_marker not in content:
    print("Markers not found")
    sys.exit(1)

start_idx = content.find(start_marker)
end_region_idx = content.find(end_marker)
end_idx = content.rfind('            </div>', 0, end_region_idx) + len('            </div>') + 1

new_html = """            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto lg:h-[800px]" id="featured-projects-grid">
                <!-- Projects will be injected here via JavaScript -->
            </div>

            <script>
                async function loadFeaturedProjects() {
                    try {
                        const response = await fetch('projects.json');
                        const allProjects = await response.json();
                        const featuredProjects = allProjects.filter(p => p.featured);
                        const container = document.getElementById('featured-projects-grid');

                        if (featuredProjects.length >= 4) {
                            const p1 = featuredProjects[0];
                            const p2 = featuredProjects[1];
                            const p3 = featuredProjects[2];
                            const p4 = featuredProjects[3];

                            const html = `
                <!-- Project 1: Large -->
                <div class="md:col-span-8 bg-surface-container-high rounded-xl overflow-hidden group border border-outline-variant/10 relative">
                    <img alt="${p1.title}" class="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" data-alt="${p1.imageAlt?.featured || ''}" src="${p1.images?.featured || ''}" />
                    <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
                    <div class="absolute bottom-0 p-10">
                        <div class="flex gap-2 mb-4">
                            ${(p1.tags?.featured || []).map(t => `<span class="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">${t}</span>`).join('')}
                            ${p1.tags?.featured?.length === 1 ? `<span class="px-3 py-1 bg-surface-bright text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-widest">LLM Agent</span>` : ''}
                        </div>
                        <h3 class="text-3xl font-headline font-bold mb-4">${p1.title}</h3>
                        <p class="text-on-surface-variant max-w-md mb-6">${p1.featuredDescription || p1.description}</p>
                        <div class="flex items-center gap-2 text-tertiary">
                            <span class="material-symbols-outlined">${p1.metrics?.icon || 'trending_up'}</span>
                            <span class="font-label text-sm font-bold">${p1.metrics?.text || ''}</span>
                        </div>
                    </div>
                </div>

                <!-- Project 2: Square -->
                <div class="md:col-span-4 bg-surface-container-high rounded-xl overflow-hidden group border border-outline-variant/10 relative">
                    <div class="absolute top-0 right-0 p-6 z-10">
                        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center neon-glow">
                            <a href="gallery.html" class="block w-full h-full text-center leading-[3rem]">
                              <span class="material-symbols-outlined text-on-primary-container align-middle">link</span>
                            </a>
                        </div>
                    </div>
                    <div class="p-8 h-full flex flex-col justify-end">
                        <p class="text-secondary font-label text-[10px] uppercase tracking-widest mb-2">${p2.category?.featured || ''}</p>
                        <h3 class="text-2xl font-headline font-bold mb-4">${p2.title}</h3>
                        <p class="text-on-surface-variant text-sm mb-6">${p2.description}</p>
                        <div class="mt-auto pt-6 border-t border-outline-variant/20">
                            <img alt="${p2.title}" class="rounded-lg h-32 w-full object-cover" data-alt="${p2.imageAlt?.featured || ''}" src="${p2.images?.featured || ''}" />
                        </div>
                    </div>
                </div>

                <!-- Project 3: Square -->
                <div class="md:col-span-4 bg-surface-container-high rounded-xl overflow-hidden group border border-outline-variant/10 relative">
                    <div class="p-8 h-full flex flex-col">
                        <div class="inline-block px-3 py-1 bg-surface-bright text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-widest mb-6 w-fit">${p3.category?.featured || ''}</div>
                        <h3 class="text-2xl font-headline font-bold mb-4">${p3.title}</h3>
                        <p class="text-on-surface-variant text-sm mb-6">${p3.description}</p>
                        <div class="mt-auto">
                            <div class="flex items-center gap-1 text-primary">
                                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
                                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
                                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
                                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
                                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star_half</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Project 4: Wide -->
                <div class="md:col-span-8 bg-surface-container-high rounded-xl overflow-hidden group border border-outline-variant/10 flex flex-col md:flex-row">
                    <div class="md:w-1/2 p-10 flex flex-col justify-center">
                        <div class="text-primary mb-4">
                            <span class="material-symbols-outlined text-4xl">${p4.metrics?.icon || ''}</span>
                        </div>
                        <h3 class="text-2xl font-headline font-bold mb-4">${p4.title}</h3>
                        <p class="text-on-surface-variant text-sm mb-6">${p4.description}</p>
                        <div class="flex items-center gap-4">
                            <div class="bg-surface-bright p-3 rounded-lg text-center min-w-[80px]">
                                <span class="block text-primary font-bold">${p4.metrics?.percentage || ''}</span>
                                <span class="text-[8px] uppercase font-label">${p4.metrics?.percentageText || ''}</span>
                            </div>
                        </div>
                    </div>
                    <div class="md:w-1/2 relative bg-surface-container-highest">
                        <img alt="${p4.title}" class="w-full h-full object-cover" data-alt="${p4.imageAlt?.featured || ''}" src="${p4.images?.featured || ''}" />
                    </div>
                </div>
                            `;
                            container.innerHTML = html;
                        }
                    } catch (error) {
                        console.error('Error loading featured projects:', error);
                    }
                }
                document.addEventListener('DOMContentLoaded', loadFeaturedProjects);
            </script>
"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content[:start_idx] + new_html + content[end_idx:])

print("Replaced successfully")

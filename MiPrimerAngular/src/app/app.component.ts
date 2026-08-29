import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pokemon, PokemonService } from './pokemon.service';

@Component({ selector: 'app-root', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './app.component.html', styleUrl: './app.component.css' })
export class AppComponent implements OnInit {
  private service = inject(PokemonService);
  pokemon: Pokemon[] = []; filtered: Pokemon[] = []; selected: Pokemon | null = null; query = ''; loading = true; error = ''; page = 0; readonly pageSize = 24;
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.error = ''; this.service.getPage(this.page * this.pageSize).subscribe({ next: (data) => { this.pokemon = data; this.applyFilter(); this.loading = false; }, error: () => { this.error = 'No pudimos cargar los Pokémon. Comprueba tu conexión e inténtalo de nuevo.'; this.loading = false; } }); }
  applyFilter(): void { const q = this.query.toLowerCase().trim(); this.filtered = this.pokemon.filter((p) => !q || p.name.includes(q) || String(p.id).padStart(3, '0').includes(q)); }
  search(): void { const q = this.query.toLowerCase().trim(); if (!q) { this.applyFilter(); return; } const match = this.pokemon.find((p) => p.name === q || String(p.id) === q); if (match) { this.selected = match; return; } if (/^\d+$/.test(q)) { this.loading = true; this.service.getByName(q).subscribe({ next: (p) => { this.selected = p; this.loading = false; }, error: () => { this.error = 'No encontramos ese Pokémon.'; this.loading = false; } }); } else this.applyFilter(); }
  nextPage(): void { this.page++; this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  previousPage(): void { if (this.page > 0) { this.page--; this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  format(value: string): string { return value.replace('-', ' '); }
}

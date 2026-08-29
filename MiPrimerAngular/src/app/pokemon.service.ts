import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Pokemon { id: number; name: string; image: string; types: string[]; height: number; weight: number; stats: { name: string; value: number }[]; abilities: string[]; }
interface ApiList { results: { name: string; url: string }[]; }
interface ApiDetail { id: number; name: string; sprites: { other?: { ['official-artwork']?: { front_default: string } }; front_default: string }; types: { type: { name: string } }[]; height: number; weight: number; stats: { base_stat: number; stat: { name: string } }[]; abilities: { ability: { name: string } }[]; }

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private http = inject(HttpClient);
  private base = 'https://pokeapi.co/api/v2';
  getPage(offset: number, limit = 24): Observable<Pokemon[]> {
    return this.http.get<ApiList>(`${this.base}/pokemon?offset=${offset}&limit=${limit}`).pipe(
      switchMap((list) => forkJoin(list.results.map((item) => this.http.get<ApiDetail>(item.url)))),
      map((items) => items.map((item) => this.normalize(item)))
    );
  }
  getByName(name: string): Observable<Pokemon> { return this.http.get<ApiDetail>(`${this.base}/pokemon/${name.toLowerCase().trim()}`).pipe(map((item) => this.normalize(item))); }
  private normalize(item: ApiDetail): Pokemon { return { id: item.id, name: item.name, image: item.sprites.other?.['official-artwork']?.front_default || item.sprites.front_default, types: item.types.map((x) => x.type.name), height: item.height, weight: item.weight, stats: item.stats.map((x) => ({ name: x.stat.name, value: x.base_stat })), abilities: item.abilities.map((x) => x.ability.name) }; }
}

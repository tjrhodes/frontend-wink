[English](README.md) · **Italiano**

# Book Search

Una ricerca dal vivo su Google Books: una single-page app responsive realizzata con React, TypeScript, Redux Toolkit e Tailwind CSS.

**Provala: [frontend-wink.vercel.app](https://frontend-wink.vercel.app/)**

- I risultati si aggiornano a ogni carattere digitato.
- Le pagine usano i parametri di Google, `startIndex` e `maxResults`, con 5, 10, 15 o 20 libri per pagina.
- Ogni libro ha la sua pagina, con i dettagli e un link a Google Books (`infoLink`).
- Ogni schermata ha un indirizzo vero, quindi Indietro, Avanti, il ricaricamento e i link condivisi funzionano tutti.

## Per iniziare

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # test unitari
npm run build      # controllo dei tipi e build in dist/
```

**Facoltativo:** senza una chiave API, Google concede poche richieste, e una ricerca dal vivo le consuma in fretta. Copia `.env.example` in `.env` e aggiungi una chiave per la Books API come `VITE_GOOGLE_BOOKS_API_KEY`. Su Vercel, aggiungi la stessa variabile nelle impostazioni del progetto.

## Come è fatta

```
src/
  config.ts                    ogni valore fisso: endpoint, dimensioni di pagina, copertina segnaposto
  main.tsx                     avvio: router, primo disegno, animazione d'ingresso
  App.tsx                      intestazione, schermata corrente, piè di pagina
  app/                         store Redux e hook tipizzati
  routing/
    routes.ts                  traduzione indirizzo ⇄ rotta (l'unico codice che conosce il formato degli URL)
    navigation.ts              il router, sulla Navigation API
    routeSlice.ts              la rotta corrente, in Redux
    Link.tsx, BackToResults.tsx
  transitions/                 transizione di pagina con GSAP e gestione del movimento ridotto
  ui/                          parti comuni: lo sfondo della fascia, messaggi di stato, avvisi
  books/
    book.ts                    il tipo Book dell'app, e la conversione dai dati di Google
    booksApi.ts                gli endpoint RTK Query per Google Books
    useLiveBookSearch.ts       la ricerca dal vivo, con l'annullamento delle richieste superate
  search/                      schermata di ricerca: campo, elenco dei risultati, paginatore, dimensione di pagina
  book/                        schermata del libro: intestazione, dati, descrizione, link a Google Books
  styles/
    theme.scss                 la palette dei colori (Sass), compilata in un tema Tailwind
    app.css                    Tailwind, font e stili di base
tests/                         test di rotte, paginazione e conversione dei dati
```

## Scelte

### L'indirizzo è l'unica fonte di verità

Il testo cercato, la pagina e la dimensione di pagina stanno nella query string (`/?q=dune&page=2&size=20`), e un libro sta in `/book/:id`. L'app legge tutto dall'indirizzo con una sola funzione (`routeFromUrl`) e costruisce ogni link con un'altra (`urlForRoute`). Così qualsiasi schermata si può salvare nei preferiti, condividere o ricaricare, e la pagina del libro carica da sola i propri dati a partire dall'id.

### Routing sulla Navigation API, non con React Router

La [Navigation API](https://developer.mozilla.org/docs/Web/API/Navigation_API) funziona in tutti i principali browser da gennaio 2026. Offre un solo evento `navigate` per ogni clic su un link, ogni pressione di Indietro/Avanti e ogni navigazione da codice, e questo ha reso possibile un router piccolo e senza dipendenze (`routing/navigation.ts`):

- I link sono semplici elementi `<a href>`, quindi il clic con la rotellina, "apri in una nuova scheda" e la copia del link funzionano normalmente.
- **Mentre si scrive, la voce della cronologia viene sostituita invece di aggiungerne una nuova.** Altrimenti Indietro cancellerebbe la ricerca una lettera alla volta. Cambiare pagina o aprire un libro aggiunge invece una voce vera.
- Tornando indietro ai risultati, si ritrova la stessa posizione di scorrimento.
- I browser senza questa API ripiegano sulla History API, senza le transizioni.

### Ricerca dal vivo e gestione della rete

La traccia chiede una nuova ricerca a ogni carattere, quindi di proposito non c'è un debounce. Invece:

- **Le richieste superate vengono annullate.** Quando la ricerca cambia, la richiesta precedente viene interrotta, così il browser smette di aspettarla.
- **Le risposte vecchie non possono sovrascrivere quelle nuove.** RTK Query mostra solo la risposta dell'ultima ricerca, quindi una risposta lenta e ormai superata non viene mai visualizzata.
- **Le risposte restano in cache.** Tornare a una pagina o a una ricerca già vista è immediato, senza nuove richieste.
- **I risultati precedenti restano visibili, attenuati,** mentre arriva la risposta successiva. Niente sfarfallii.
- **I limiti di frequenza vengono gestiti con nuovi tentativi.** La risposta "troppe richieste" di Google (429) è facile da ottenere con una ricerca dal vivo, soprattutto senza chiave API. Quelle richieste vengono ritentate da sole, dopo una breve pausa che si allunga ogni volta.
- **Gli errori hanno spiegazioni semplici,** in un avviso che fluttua sopra la pagina. I risultati che si hanno già restano al loro posto.

### Niente salti

Ogni riga dei risultati ha la stessa altezza fissa: una riga di titolo, una di autori, due di descrizione. I segnaposto di caricamento sono costruiti con lo stesso layout, e la barra con il conteggio c'è fin dalla prima lettera. Lo spazio per una pagina intera di righe viene riservato dall'inizio, così niente si sposta mentre i risultati cambiano sotto le dita. In un test, scrivendo "dune messiah" con risposte rallentate e limitate, Chrome ha misurato un punteggio di spostamento del layout pari a 0 da quando i primi risultati sono comparsi. Lo stato di caricamento della pagina del libro usa la cornice vera dell'intestazione, e la pagina tiene sempre lo spazio per la barra di scorrimento.

### I dati di Google, gestiti in un unico posto

`books/book.ts` trasforma i dati di Google, annidati e quasi tutti facoltativi, in oggetti `Book` completi:

- i campi mancanti ricevono valori predefiniti sensati;
- si usa la copertina più grande disponibile, riscritta da `http` a `https`;
- i libri senza copertina ricevono il segnaposto della traccia (`placehold.co`, 400×600, `FF5039`, "Book Cover"), e così anche le copertine che non si caricano;
- le descrizioni vengono conservate sia come testo semplice, per il riassunto su due righe, sia come HTML per la pagina del libro.

Nella pagina del libro, l'HTML viene ripulito con DOMPurify prima di essere mostrato.

### Paginazione senza fidarsi dei totali di Google

Il `totalItems` di Google non si può usare per calcolare l'ultima pagina. L'ho verificato con ricerche vere:

- **Il totale cresce mentre si sfogliano le pagine.** Per "kureishi", la pagina 1 dice 472, al risultato 30 dice 2.125, e più avanti 13.134.
- **I risultati veri finiscono molto prima,** intorno a 350.

Un paginatore basato su quel totale porta a pagine che non esistono. Per questo (`search/usePagingFacts.ts`):

- **Il conteggio è la stima della pagina 1,** mostrata come "About …" (circa), senza "di N". Non cresce mentre si sfogliano le pagine.
- **Il paginatore non mostra mai un'ultima pagina.** Mostra la pagina 1, le pagine appena precedenti a quella corrente e la pagina successiva solo quando esiste.
- **"Next" (avanti) compare solo quando porta da qualche parte.** La pagina corrente deve essere piena, e un'occhiata discreta in anticipo alla pagina successiva non deve essere tornata vuota. Questa verifica aspetta che si smetta di scrivere, e fa anche sì che la pagina successiva si apra all'istante, dalla cache.
- **Se una pagina torna comunque vuota,** per esempio da un link vecchio, lo dice e rimanda alla pagina precedente.

### Colori del tema in Sass

Tailwind v4 non elabora il Sass, quindi `styles/theme.scss` contiene la palette come mappa Sass. Calcola anche alcune sfumature con le funzioni di colore di Sass, e produce un blocco `@theme` per Tailwind. Un piccolo plugin di Vite lo compila all'avvio e a ogni salvataggio, e Tailwind trasforma ogni colore in classi di utilità (`bg-rock`, `text-lichen`, …). La palette e la tipografia Fira Sans vengono dal mio sito portfolio, [tomrhodes.it](https://tomrhodes.it).

### Movimento

GSAP anima il passaggio tra le schermate. La fascia blu in alto resta sempre sullo schermo:

1. Nella pagina di un libro, le lettere del titolo scendono via, dall'ultima alla prima.
2. Il vecchio contenuto sfuma via, con un ease-in deciso.
3. La fascia si allunga o si accorcia fino all'altezza della nuova schermata, con un ease-in-out pesante.
4. Il nuovo contenuto compare in dissolvenza, con un ease-out deciso.
5. Nella pagina di un libro, il titolo si compone lettera per lettera con SplitText di GSAP, ogni parola nella sua maschera.

Il titolo viene diviso solo durante l'animazione, poi torna testo semplice, così per il resto del tempo lo controlla React. Sul titolo crenatura e legature sono disattivate, così le lettere non si spostano quando vengono divise.

La fascia tiene conto anche dello scorrimento (`transitions/bandTransition.ts`). Anima sempre e solo la parte della fascia che si vede davvero:

1. **All'uscita,** annota quanti pixel della fascia sono visibili: tutta, una parte o niente.
2. **Quando il contenuto è sparito,** in un solo fotogramma la pagina torna in cima e la fascia sostitutiva prende esattamente quell'altezza. A vista non cambia nulla, anche se il browser ha fatto scorrere da solo una nuova schermata più corta.
3. **Poi la fascia cresce o si riduce,** con l'ease pesante, fino a quanta parte della nuova fascia si vedrà nella nuova posizione di scorrimento.
4. **La pagina salta alla nuova posizione** in un solo fotogramma, e il contenuto compare.

Così una fascia tutta visibile si trasforma, una scorsa in parte cresce da quello che si vedeva, e una scorsa via del tutto cresce da zero sotto l'intestazione, o risale fino a sparire sotto di essa. Il router ricorda la posizione di scorrimento di ogni voce della cronologia, quindi sa dove porterà Indietro prima di arrivarci.

Mentre la vecchia schermata sfuma, il router carica già quello che serve alla nuova (`routing/prepareRoute.ts`). Per la pagina di un libro, sono i dati del libro e poi l'immagine della copertina: aspetta al massimo 0,4 secondi per la copertina e 1,5 secondi in tutto. Così la pagina arriva completa, e la fascia cresce direttamente fino all'altezza finale. Se una copertina sta ancora caricando, il suo riquadro (già a grandezza piena) mostra una leggera pulsazione e un piccolo spinner giallo lichene, e l'immagine compare in dissolvenza appena arriva. Le copertine dei risultati fanno lo stesso.

Ogni durata passa per un'unica funzione, così chi chiede al sistema un movimento ridotto vede i cambiamenti all'istante. Dopo ogni nuova schermata, il focus della tastiera passa al campo di ricerca o al titolo della pagina.

## Pubblicazione su Vercel

Importa il repository su Vercel. Riconosce Vite e non servono impostazioni. `vercel.json` manda ogni indirizzo a `index.html`, così link come `/book/abc123` funzionano anche aperti direttamente.

Font: Fira Sans e Fira Sans Condensed, di Carrois Apostrophe, con licenza SIL Open Font License.

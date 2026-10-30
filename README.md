# MG Intern

Intern informations- og værktøjsside for elever og lærere på Middelfart Gymnasium. Se [AGENTS.md](AGENTS.md) for formål og regler – især: **intet personfølsomt indhold**.

## Se siden lokalt

Åbn `index.html` direkte i en browser (dobbeltklik). Der er intet build-step.

Alternativt med en lille lokal server:

```bash
python3 -m http.server 8000
```

og gå til <http://localhost:8000>.

## Tilpasning

- Links til kalender og PDF-værktøjer på smbi.dk: `assets/config.js`
- Farver og udseende: variablerne øverst i `assets/style.css`
- Menu og søgning: `assets/site.js`

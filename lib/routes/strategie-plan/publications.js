import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    // L'URL de base et la page cible
    const rootUrl = 'https://www.strategie-plan.gouv.fr';
    const currentUrl = `${rootUrl}/publications`;

    // 1. On télécharge le code de la page des publications
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    // 2. On utilise 'cheerio' pour lire le code HTML comme on le ferait avec un navigateur
    const $ = load(response.data);

    // 3. On repère les "blocs" d'articles sur la page (à ajuster selon le code source exact du site)
    // Ici, on cible de façon générique les balises 'article' ou les lignes de vue classiques
    const items = $('article').toArray().map((item) => {
        item = $(item);
        const titleElement = item.find('h2, h3').first();
        const linkElement = item.find('a').first();
        const link = linkElement.attr('href');

        return {
            // Titre de la publication
            title: titleElement.text().trim(),
            // Construction du lien complet
            link: link ? (link.startsWith('http') ? link : `${rootUrl}${link}`) : currentUrl,
            // Description (résumé)
            description: item.find('.description, p').text().trim(),
            // Date de publication (Cheerio tente de trouver la balise de temps)
            pubDate: parseDate(item.find('time, .date').text().trim()),
        };
    });

    // 4. On assemble et on renvoie le flux RSS final
    ctx.set('data', {
        title: 'Publications - Haut-commissariat à la Stratégie et au Plan',
        link: currentUrl,
        item: items,
    });
};

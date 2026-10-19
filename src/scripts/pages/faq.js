import { t } from '../core/i18n.js';

export function initFaq() {
  const container = document.getElementById('faq-list');
  const search = document.getElementById('faq-search');
  const openQuestions = new Set();
  const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();

  function renderQuestions() {
    const questions = t('preguntasFrecuentes', { returnObjects: true });
    const query = normalize(search.value.trim());
    container.replaceChildren();

    questions.forEach((item, index) => {
      if (!normalize(item.pregunta).includes(query)) return;
      const article = document.createElement('article');
      article.className = 'faq-item';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'faq-item__question';
      button.setAttribute('aria-expanded', String(openQuestions.has(index)));
      button.setAttribute('aria-controls', 'faq-answer-' + index);
      const arrow = document.createElement('span');
      arrow.className = 'faq-item__arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '▶';
      button.append(arrow, ' ' + item.pregunta);
      const answer = document.createElement('div');
      answer.id = 'faq-answer-' + index;
      answer.className = 'faq-item__answer';
      answer.textContent = item.respuesta;
      answer.hidden = !openQuestions.has(index);

      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(expanded));
        answer.hidden = !expanded;
        if (expanded) openQuestions.add(index);
        else openQuestions.delete(index);
      });
      article.append(button, answer);
      container.append(article);
    });

    if (!container.childElementCount) {
      const message = document.createElement('p');
      message.textContent = t('faq.sinResultados');
      container.append(message);
    }
  }

  search.addEventListener('input', renderQuestions);
  document.addEventListener('languagechange', renderQuestions);
  renderQuestions();
}

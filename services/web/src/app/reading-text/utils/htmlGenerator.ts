import { ReadingTextParams } from '../types'

// Трансформации текста (копия из PDF-сервиса)
function transformText(text: string, type: string, options: any = {}): string {
  switch (type) {
    case 'normal':
      return text

    case 'bottom-cut':
      const cutPercentage = options.cutPercentage || 40
      // Пословная обработка: каждое слово в отдельном span с настраиваемым процентом
      return text.split(/(\s+)/).map(part => {
        // Только слова оборачиваем, пробелы оставляем как есть
        return part.trim()
          ? `<span class="bottom-cut-pseudo" style="--cut-height: ${cutPercentage}%">${part}</span>`
          : part
      }).join('')

    case 'top-cut':
      const topCutPercentage = options.cutPercentage || 40
      // Пословная обработка: каждое слово в отдельном span с настраиваемым процентом
      return text.split(/(\s+)/).map(part => {
        // Только слова оборачиваем, пробелы оставляем как есть
        return part.trim()
          ? `<span class="top-cut-pseudo" style="--cut-height: ${topCutPercentage}%">${part}</span>`
          : part
      }).join('')

    case 'missing-endings':
      const endingLength = options.endingLength || 2
      const words = text.split(/(\\s+|[.,!?;:])/)
      return words.map(word => {
        if (!/^[а-яё]+$/i.test(word) || word.length <= endingLength + 1) {
          return word
        }
        const truncated = word.slice(0, -endingLength)
        const underscores = '_'.repeat(endingLength)
        return truncated + underscores
      }).join('')

    case 'missing-vowels':
      return text.replace(/[аеёиоуыэюя]/gi, '_')

    case 'mirror-text':
      const reversed = text.split('').reverse().join('')
      return `<span class="mirror-text">${reversed}</span>`

    default:
      return text
  }
}

// CSS стили для PDF
function getCSS(): string {
  return `
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 2cm;
        line-height: 1.6;
        margin: 0;
      }
      .title {
        font-size: 18pt;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
      }
      .exercise-text {
        font-size: 14pt;
        line-height: 1.8;
        padding: 20px;
        border: 1px solid #ccc;
        margin: 20px 0;
      }
      .metadata {
        font-size: 10pt;
        color: #666;
        margin-bottom: 20px;
      }

      /* CSS-методы обрезания текста */

      /* Метод 1: overflow hidden - базовый метод */
      .bottom-cut-overflow {
        display: inline-block;
        height: 0.4em;
        overflow: hidden;
        vertical-align: baseline;
      }

      .top-cut-overflow {
        display: inline-block;
        height: 0.6em;
        overflow: hidden;
        line-height: 1em;
        margin-top: 0.4em;
        vertical-align: baseline;
      }

      /* Метод 2: clip-path - современный метод */
      .bottom-cut-clippath {
        display: inline-block;
        clip-path: polygon(0% 60%, 100% 60%, 100% 100%, 0% 100%);
        vertical-align: baseline;
        line-height: 1 !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .top-cut-clippath {
        display: inline-block;
        clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 0% 40%);
        vertical-align: baseline;
        line-height: 1 !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* Метод 3: scaleY - трансформация */
      .bottom-cut-scale {
        display: inline-block;
        transform: scaleY(0.4) translateY(60%);
        transform-origin: bottom;
        vertical-align: baseline;
      }

      .top-cut-scale {
        display: inline-block;
        transform: scaleY(0.6) translateY(-40%);
        transform-origin: top;
        vertical-align: baseline;
      }

      /* Метод 4: псевдоэлементы - через :before/:after */
      .bottom-cut-pseudo {
        position: relative;
        display: inline-block;
        vertical-align: baseline;
      }

      .bottom-cut-pseudo:before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--cut-height, 60%);
        background: white;
        z-index: 1;
      }

      .top-cut-pseudo {
        position: relative;
        display: inline-block;
        vertical-align: baseline;
      }

      .top-cut-pseudo:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: var(--cut-height, 60%);
        background: white;
        z-index: 1;
      }

      /* Метод 5: CSS mask - маскирование */
      .bottom-cut-mask {
        display: inline-block;
        mask: linear-gradient(to bottom, transparent 0%, transparent 60%, black 60%, black 100%);
        -webkit-mask: linear-gradient(to bottom, transparent 0%, transparent 60%, black 60%, black 100%);
        vertical-align: baseline;
      }

      .top-cut-mask {
        display: inline-block;
        mask: linear-gradient(to bottom, black 0%, black 40%, transparent 40%, transparent 100%);
        -webkit-mask: linear-gradient(to bottom, black 0%, black 40%, transparent 40%, transparent 100%);
        vertical-align: baseline;
      }

      /* ОСНОВНОЙ МЕТОД - используется в продакшене */
      .bottom-cut {
        --cut-percentage: 60%;
        display: inline-block;
        clip-path: polygon(0% var(--cut-percentage), 100% var(--cut-percentage), 100% 100%, 0% 100%);
        vertical-align: baseline;
      }

      .top-cut {
        --cut-percentage: 40%;
        display: inline-block;
        clip-path: polygon(0% 0%, 100% 0%, 100% var(--cut-percentage), 0% var(--cut-percentage));
        vertical-align: baseline;
      }

      /* Стили для других трансформаций */
      .extra-letter {
        color: #888;
        font-weight: normal;
      }

      .mirror-text {
        transform: scaleX(-1);
        display: inline-block;
      }
    </style>
  `
}

// Главная функция генерации HTML
export function generateReadingTextHTML(params: ReadingTextParams): string {
  const transformedText = transformText(params.inputText, params.textType, {
    cutPercentage: params.cutPercentage,
    endingLength: params.endingLength,
    reversedWordCount: params.reversedWordCount,
    extraLetterDensity: params.extraLetterDensity
  })

  const words = params.inputText.trim().split(/\\s+/).filter(w => w.length > 0)

  const typeNames: Record<string, string> = {
    'normal': 'Обычный текст',
    'bottom-cut': 'Текст с обрезанной нижней частью',
    'top-cut': 'Текст с обрезанной верхней частью',
    'missing-endings': 'Текст без окончаний',
    'missing-vowels': 'Текст без гласных букв',
    'partial-reversed': 'Текст с перевернутыми словами',
    'scrambled-words': 'Анаграммы',
    'merged-text': 'Слитный текст',
    'extra-letters': 'Текст с лишними буквами',
    'mirror-text': 'Зеркальный текст',
    'mixed-types': 'Смешанный тип',
    'word-ladder': 'Лесенка из слов'
  }

  const title = params.hasTitle && params.title ? params.title : typeNames[params.textType] || 'Упражнение для чтения'

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${getCSS()}
</head>
<body>
  ${params.hasTitle ? `<div class="title">${title}</div>` : ''}

  <div class="metadata">
    <p>Тип: ${typeNames[params.textType] || params.textType} | Слов: ${words.length} | Размер шрифта: ${params.fontSize}</p>
  </div>

  <div style="margin: 10px 0;">
    ${transformedText}
  </div>


  <div style="page-break-before: always;">
    <div class="title">Исходный текст</div>
    <div class="exercise-text">
      ${params.inputText}
    </div>
  </div>
</body>
</html>`
}
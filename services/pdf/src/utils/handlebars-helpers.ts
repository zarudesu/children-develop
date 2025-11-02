import Handlebars from 'handlebars'

// Общие хелперы для всех шаблонов
export function registerCommonHelpers(): void {
  // Хелпер сравнения для условий
  if (!Handlebars.helpers.eq) {
    Handlebars.registerHelper('eq', function(a: any, b: any) {
      return a === b
    })
  }

  // Хелпер увеличения индекса на 1
  if (!Handlebars.helpers.index_plus_one) {
    Handlebars.registerHelper('index_plus_one', function(this: any) {
      return this['@index'] + 1
    })
  }

  // Хелпер для размера шрифта
  if (!Handlebars.helpers.fontSize) {
    Handlebars.registerHelper('fontSize', function(size: string) {
      const fontSizes: Record<string, string> = {
        'super-huge': '40px',
        'huge': '32px',
        'extra-large': '24px',
        'large': '18px',
        'medium': '14px'
      }
      return fontSizes[size] || '14px'
    })
  }

  // Хелпер для семейства шрифта
  if (!Handlebars.helpers.fontFamily) {
    Handlebars.registerHelper('fontFamily', function(family: string) {
      const fontFamilies: Record<string, string> = {
        'serif': '"Times New Roman", Times, serif',
        'sans-serif': '"Arial", "Helvetica", sans-serif',
        'mono': '"Courier New", Courier, monospace',
        'cursive': '"Kalam", "Comic Sans MS", cursive',
        'propisi': '"Propisi", cursive'
      }
      return fontFamilies[family] || fontFamilies['serif']
    })
  }
}

/* =====================================================
   MARIA RITA — PORTFÓLIO ARTÍSTICO
   SCRIPT COMPLETO
   ===================================================== */

(() => {
  "use strict";

  /* 01. CONFIGURAÇÃO */

  const root = document.documentElement;

  const select = (selector, context = document) =>
    context.querySelector(selector);

  const selectAll = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const hero = select(".hero");
  const heroArtwork = select(".hero-artwork");
  const heroContainer = select(".hero-container");

  const manifestoLines = selectAll(
    ".hero-manifesto span"
  );

  const ragVisual = select(
    ".featured-project__visual"
  );

  const sections = selectAll(".section");

  let storyStage = null;
  let scrollFrame = null;
  let starAnimation = null;
  let revealObserver = null;

  /* =====================================================
     02. ESTRELA DOURADA
     ===================================================== */

  function setupStar() {
    const star = select(".site-brand__symbol");

    if (!star) return;
    if (motionPreference.matches) return;
    if (typeof star.animate !== "function") return;

    starAnimation = star.animate(
      [
        {
          transform:
            "translate3d(0, 0, 0) scale(1)",
          filter:
            "drop-shadow(0 0 2px rgba(229,186,103,.3))"
        },
        {
          transform:
            "translate3d(0, -5px, 0) scale(.84)",
          filter:
            "drop-shadow(0 0 9px rgba(240,202,115,.85))"
        },
        {
          transform:
            "translate3d(0, 0, 0) scale(1)",
          filter:
            "drop-shadow(0 0 2px rgba(229,186,103,.3))"
        }
      ],
      {
        duration: 5500,
        iterations: Infinity,
        easing: "ease-in-out"
      }
    );
  }

  /* =====================================================
     03. NARRATIVA DA PINTURA
     ===================================================== */

  function setupScrollStory() {
    if (!hero) return;
    if (manifestoLines.length !== 3) return;
    if (motionPreference.matches) return;

    if (!CSS.supports("position", "sticky")) {
      return;
    }

    // Cria o palco sem alterar o index.html.

    storyStage = document.createElement("div");
    storyStage.className = "hero-story-stage";

    hero.parentNode.insertBefore(storyStage, hero);
    storyStage.appendChild(hero);

    root.classList.add("has-scroll-story");

    updateScrollStory();
  }

  function updateScrollStory() {
    if (!storyStage) return;
    if (motionPreference.matches) return;

    const rect =
      storyStage.getBoundingClientRect();

    const distance = Math.max(
      1,
      storyStage.offsetHeight - window.innerHeight
    );

    // 0 = início
    // 1 = fim da primeira cena

    const progress = clamp(
      -rect.top / distance
    );

    /* As frases aparecem na ordem correta
       e desaparecem quando rolamos de volta. */

    const thresholds = [
      0.10,
      0.34,
      0.58
    ];

    manifestoLines.forEach((line, index) => {
      line.classList.toggle(
        "is-written",
        progress >= thresholds[index]
      );
    });

    /* A pintura só começa a desaparecer
       depois das três frases. */

    const dissolveProgress = clamp(
      (progress - 0.78) / 0.22
    );

    if (heroArtwork) {
      // De 1 até 0:
      // as cores misturadas são reveladas.

      heroArtwork.style.opacity = (
        1 - dissolveProgress
      ).toFixed(3);
    }

    /*
       O texto se dissolve um pouco no final,
       mas permanece acima das cores.
    */

    if (heroContainer) {
      heroContainer.style.opacity = (
        1 - dissolveProgress * 0.5
      ).toFixed(3);
    }
  }

  /* =====================================================
     04. MOVIMENTO DAS CORES NO SCROLL
     ===================================================== */

  /*
     O movimento contínuo das cores é CSS.

     O JS apenas acrescenta um deslocamento
     suave conforme a pessoa percorre a página.
  */

  function updateColorMovement() {
    if (motionPreference.matches) return;

    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();

      if (
        rect.bottom < -100 ||
        rect.top > viewportHeight + 100
      ) {
        return;
      }

      const sectionCenter =
        rect.top + rect.height / 2;

      const shift = clamp(
        (viewportCenter - sectionCenter) * 0.04,
        -32,
        32
      );

      section.style.setProperty(
        "--paint-shift",
        `${shift.toFixed(2)}px`
      );
    });
  }

  /* =====================================================
     05. REVELAÇÃO DAS SEÇÕES
     ===================================================== */

  function setupSectionReveals() {
    if (motionPreference.matches) return;

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const selectors = [
      ".section--about .section-header",
      ".about-content",
      ".section--technologies .section-header",
      ".technologies-content",
      ".section--featured-project .section-header",
      ".featured-project__content",
      ".featured-project__visual",
      ".section--journey .section-header",
      ".journey-timeline__item",
      ".section--contact .section-header",
      ".contact-content"
    ];

    const elements = selectors.flatMap(
      selector => selectAll(selector)
    );

    revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const element = entry.target;

          if (entry.isIntersecting) {
            element.classList.remove(
              "is-reveal-pending"
            );

            element.classList.add(
              "is-revealed"
            );
          } else {
            /*
               O elemento volta ao estado inicial
               quando deixa a região visível.

               Isso permite repetir a entrada
               ao subir e descer novamente.
            */

            element.classList.remove(
              "is-revealed"
            );

            element.classList.add(
              "is-reveal-pending"
            );
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px"
      }
    );

    elements.forEach(element => {
      element.setAttribute(
        "data-scroll-reveal",
        ""
      );

      element.classList.add(
        "is-reveal-pending"
      );

      revealObserver.observe(element);
    });
  }

  /* =====================================================
     06. RAG TUTOR — PINCELADAS REVERSÍVEIS
     ===================================================== */

  function setupRagPainting() {
    if (!ragVisual) return;
    if (motionPreference.matches) return;

    ragVisual.classList.add("paint-ready");

    for (let index = 1; index <= 8; index++) {
      ragVisual.style.setProperty(
        `--stroke-${index}`,
        "0%"
      );
    }

    updateRagPainting();
  }

  function updateRagPainting() {
    if (!ragVisual) return;
    if (motionPreference.matches) return;

    const rect =
      ragVisual.getBoundingClientRect();

    const height = window.innerHeight;

    /*
       Começa quando o RAG entra na tela.
       Termina depois de avançarmos mais
       um pouco na seção.

       O progresso é recalculado sempre.
       Não existe trava definitiva.
    */

    const start = height * 0.90;
    const finish = height * 0.20;

    const progress = clamp(
      (start - rect.top) / (start - finish)
    );

    /*
       Ao voltar para cima, a máscara volta.
       Ao chegar ao fim, é removida.
    */

    if (progress >= 0.995) {
      ragVisual.classList.remove(
        "paint-ready"
      );

      ragVisual.classList.add(
        "paint-complete"
      );
    } else {
      ragVisual.classList.remove(
        "paint-complete"
      );

      ragVisual.classList.add(
        "paint-ready"
      );
    }

    /*
       Oito pinceladas horizontais.
       Pequenas diferenças entre elas criam
       uma revelação menos mecânica.
    */

    for (let index = 0; index < 8; index++) {
      const delay = index * 0.045;

      const localProgress = clamp(
        (progress - delay) / (1 - delay)
      );

      const variation =
        Math.sin(index * 2.2) * 0.025;

      const strokeProgress = clamp(
        localProgress + variation
      );

      const width = strokeProgress * 100;

      ragVisual.style.setProperty(
        `--stroke-${index + 1}`,
        `${width.toFixed(2)}%`
      );
    }
  }

  /* =====================================================
     07. MENU MOBILE
     ===================================================== */

  function setupMobileMenu() {
    const header = select(".site-header");
    const toggle = select(".mobile-menu-toggle");
    const navigation = select(".main-navigation");

    if (!header || !toggle || !navigation) {
      return;
    }

    function updateMenuLabel() {
      const open = header.classList.contains(
        "is-menu-open"
      );

      const english = root.lang === "en";

      toggle.setAttribute(
        "aria-expanded",
        String(open)
      );

      toggle.setAttribute(
        "aria-label",
        english
          ? (open
              ? "Close navigation menu"
              : "Open navigation menu")
          : (open
              ? "Fechar menu de navegação"
              : "Abrir menu de navegação")
      );
    }

    function closeMenu() {
      header.classList.remove("is-menu-open");
      updateMenuLabel();
    }

    toggle.addEventListener("click", () => {
      header.classList.toggle("is-menu-open");
      updateMenuLabel();
    });

    selectAll(
      ".navigation-list a",
      navigation
    ).forEach(link => {
      link.addEventListener(
        "click",
        closeMenu
      );
    });

    document.addEventListener(
      "keydown",
      event => {
        if (event.key === "Escape") {
          closeMenu();
        }
      }
    );

    document.addEventListener(
      "click",
      event => {
        if (!header.contains(event.target)) {
          closeMenu();
        }
      }
    );

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 800) {
          closeMenu();
        }
      },
      { passive: true }
    );

    header.classList.add(
      "is-menu-enabled"
    );

    updateMenuLabel();
  }

  /* =====================================================
     08. TRADUÇÃO PORTUGUÊS / INGLÊS
     ===================================================== */

  const translations = {
    "pt-BR": {
      "nav.home": "INÍCIO",
      "nav.about": "SOBRE",
      "nav.technologies": "TECNOLOGIAS",
      "nav.project": "PROJETO",
      "nav.journey": "TRAJETÓRIA",
      "nav.contact": "CONTATO",

      "nav.openMenu": "Abrir menu de navegação",
      "nav.closeMenu": "Fechar menu de navegação",

      "hero.profession":
        "ENGENHEIRA DE P.R.O.M.P.T.",

      "hero.specialties":
        "IA GENERATIVA · RAG · APLICAÇÕES DE INTELIGÊNCIA ARTIFICIAL",

      "hero.manifesto.line1":
        "Problema entendido.",

      "hero.manifesto.line2":
        "Solução construída.",

      "hero.manifesto.line3":
        "Conhecimento compartilhado.",

      "hero.projects": "VER PROJETOS",
      "hero.contact": "ENTRAR EM CONTATO",
      "hero.scroll": "ROLE PARA EXPLORAR",

      "about.title": "SOBRE MIM",

      "about.statement":
        "ENTRE CÓDIGO E ARTE, TRANSFORMO PROBLEMAS EM SOLUÇÕES.",

      "about.description":
        "Sou Maria Rita, profissional de Inteligência Artificial em formação, com foco em Engenharia de Prompt, RAG e aplicações de IA. Gosto de entender problemas, estudar como as ferramentas funcionam e construir soluções que façam sentido, unindo raciocínio, tecnologia e criatividade.",

      "technologies.title": "TECNOLOGIAS",
      "technologies.generativeAI": "IA Generativa",
      "technologies.semanticSearch": "Busca Semântica",

      "project.sectionTitle":
        "PROJETO EM DESTAQUE",

      "project.description":
        "Sistema educacional de RAG com busca semântica, recuperação de contexto e tratamento de perguntas fora da base.",

      "project.technologiesLabel":
        "Tecnologias e conceitos utilizados",

      "project.tryApplication":
        "TESTAR APLICAÇÃO",

      "project.viewCode":
        "VER CÓDIGO",

      "journey.title": "TRAJETÓRIA",

      "journey.entry":
        "Entrada e estudos em tecnologia",

      "journey.aiDevelopment":
        "Desenvolvimento em Inteligência Artificial",

      "journey.practicalProjects":
        "Projetos e aplicações práticas",

      "contact.title": "CONTATO",

      "contact.headline":
        "VAMOS CONSTRUIR ALGUMA COISA?",

      "contact.description":
        "Se você quer conversar sobre tecnologia, Inteligência Artificial, projetos ou oportunidades, me encontre por aqui.",

      "contact.email": "E-MAIL",

      "footer.signature":
        "IA · CÓDIGO · ARTE",

      "social.whatsapp":
        "Conversar pelo WhatsApp",

      "social.email":
        "Enviar e-mail para Maria Rita"
    },

    en: {
      "nav.home": "HOME",
      "nav.about": "ABOUT",
      "nav.technologies": "TECHNOLOGIES",
      "nav.project": "PROJECT",
      "nav.journey": "JOURNEY",
      "nav.contact": "CONTACT",

      "nav.openMenu": "Open navigation menu",
      "nav.closeMenu": "Close navigation menu",

      "hero.profession":
        "P.R.O.M.P.T. ENGINEER",

      "hero.specialties":
        "GENERATIVE AI · RAG · ARTIFICIAL INTELLIGENCE APPLICATIONS",

      "hero.manifesto.line1":
        "Problem understood.",

      "hero.manifesto.line2":
        "Solution built.",

      "hero.manifesto.line3":
        "Knowledge shared.",

      "hero.projects": "VIEW PROJECTS",
      "hero.contact": "GET IN TOUCH",
      "hero.scroll": "SCROLL TO EXPLORE",

      "about.title": "ABOUT ME",

      "about.statement":
        "BETWEEN CODE AND ART, I TURN PROBLEMS INTO SOLUTIONS.",

      "about.description":
        "I'm Maria Rita, an emerging Artificial Intelligence professional focused on Prompt Engineering, RAG, and AI applications. I enjoy understanding problems, exploring how tools work, and building meaningful solutions by combining reasoning, technology and creativity.",

      "technologies.title": "TECHNOLOGIES",
      "technologies.generativeAI": "Generative AI",
      "technologies.semanticSearch": "Semantic Search",

      "project.sectionTitle":
        "FEATURED PROJECT",

      "project.description":
        "An educational RAG system featuring semantic search, context retrieval, and handling of questions outside its knowledge base.",

      "project.technologiesLabel":
        "Technologies and concepts used",

      "project.tryApplication":
        "TRY APPLICATION",

      "project.viewCode":
        "VIEW CODE",

      "journey.title": "JOURNEY",

      "journey.entry":
        "Getting started and studying technology",

      "journey.aiDevelopment":
        "Development in Artificial Intelligence",

      "journey.practicalProjects":
        "Projects and practical applications",

      "contact.title": "CONTACT",

      "contact.headline":
        "SHALL WE BUILD SOMETHING TOGETHER?",

      "contact.description":
        "If you'd like to talk about technology, Artificial Intelligence, projects, or opportunities, you can reach me here.",

      "contact.email": "EMAIL",

      "footer.signature":
        "AI · CODE · ART",

      "social.whatsapp":
        "Chat on WhatsApp",

      "social.email":
        "Send an email to Maria Rita"
    }
  };

  function changeLanguage(language) {
    const dictionary = translations[language];

    if (!dictionary) return;

    /* Textos */

    selectAll("[data-i18n]").forEach(
      element => {
        const key = element.dataset.i18n;

        if (dictionary[key] !== undefined) {
          element.textContent = dictionary[key];
        }
      }
    );

    /* Descrições para acessibilidade */

    selectAll(
      "[data-i18n-aria-label]"
    ).forEach(element => {
      const key = element.getAttribute(
        "data-i18n-aria-label"
      );

      if (dictionary[key] !== undefined) {
        element.setAttribute(
          "aria-label",
          dictionary[key]
        );
      }
    });

    root.lang = language;

    document.title =
      language === "en"
        ? "Maria Rita | P.R.O.M.P.T. Engineer"
        : "Maria Rita | Engenheira de P.R.O.M.P.T.";

    /* Estado dos botões */

    selectAll(
      ".language-button"
    ).forEach(button => {
      const active =
        button.dataset.language === language;

      button.classList.toggle(
        "is-active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    /* Atualiza o texto do botão mobile */

    const toggle = select(
      ".mobile-menu-toggle"
    );

    const header = select(
      ".site-header"
    );

    if (toggle && header) {
      const open = header.classList.contains(
        "is-menu-open"
      );

      toggle.setAttribute(
        "aria-label",
        language === "en"
          ? (open
              ? "Close navigation menu"
              : "Open navigation menu")
          : (open
              ? "Fechar menu de navegação"
              : "Abrir menu de navegação")
      );
    }

    requestScrollUpdate();
  }

  function setupLanguageSwitcher() {
    selectAll(
      ".language-button"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          changeLanguage(
            button.dataset.language
          );
        }
      );
    });
  }

  /* =====================================================
     09. ANO AUTOMÁTICO
     ===================================================== */

  function setupFooterYear() {
    const element = select(
      "[data-current-year]"
    );

    if (!element) return;

    const year = String(
      new Date().getFullYear()
    );

    element.textContent = year;
    element.setAttribute(
      "datetime",
      year
    );
  }

  /* =====================================================
     10. CONTROLE EFICIENTE DE SCROLL
     ===================================================== */

  function updateScrollEffects() {
    scrollFrame = null;

    updateScrollStory();
    updateColorMovement();
    updateRagPainting();
  }

  function requestScrollUpdate() {
    if (scrollFrame !== null) return;

    scrollFrame =
      window.requestAnimationFrame(
        updateScrollEffects
      );
  }

  function setupGlobalEvents() {
    window.addEventListener(
      "scroll",
      requestScrollUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestScrollUpdate,
      { passive: true }
    );

    window.addEventListener(
      "load",
      requestScrollUpdate,
      { once: true }
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) {
          requestScrollUpdate();
        }
      }
    );
  }

  /* =====================================================
     11. MOVIMENTO REDUZIDO
     ===================================================== */

  function setupMotionPreference() {
    motionPreference.addEventListener(
      "change",
      event => {
        if (!event.matches) {
          // Recarrega a página para montar
          // novamente os efeitos de maneira
          // consistente, se a preferência mudou.
          window.location.reload();
          return;
        }

        if (starAnimation) {
          starAnimation.cancel();
          starAnimation = null;
        }

        if (storyStage && hero) {
          storyStage.parentNode.insertBefore(
            hero,
            storyStage
          );

          storyStage.remove();
          storyStage = null;

          root.classList.remove(
            "has-scroll-story"
          );
        }

        if (heroArtwork) {
          heroArtwork.style.opacity = "";
        }

        if (heroContainer) {
          heroContainer.style.opacity = "";
        }

        manifestoLines.forEach(line => {
          line.classList.add("is-written");
        });

        if (revealObserver) {
          revealObserver.disconnect();
          revealObserver = null;
        }

        selectAll(
          "[data-scroll-reveal]"
        ).forEach(element => {
          element.classList.remove(
            "is-reveal-pending"
          );

          element.classList.add(
            "is-revealed"
          );
        });

        if (ragVisual) {
          ragVisual.classList.remove(
            "paint-ready"
          );

          ragVisual.classList.add(
            "paint-complete"
          );
        }
      }
    );
  }

  /* =====================================================
     12. INICIALIZAÇÃO
     ===================================================== */

  function initializePortfolio() {
    root.classList.add("js-enhanced");

    /* Funções gerais */

    setupFooterYear();
    setupLanguageSwitcher();
    setupMobileMenu();

    /* Experiência artística */

    setupStar();
    setupScrollStory();
    setupSectionReveals();
    setupRagPainting();

    /* Eventos */

    setupMotionPreference();
    setupGlobalEvents();

    requestScrollUpdate();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializePortfolio,
      { once: true }
    );
  } else {
    initializePortfolio();
  }
})();

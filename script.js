// ========== GLOBAL FEATURES ==========

// Highlight active nav link (also apply CSS class so colors/transition work)
document.querySelectorAll("nav a").forEach(link => {
  const linkHref = link.href.split("?")[0].split("#")[0];
  const currentHref = window.location.href.split("?")[0].split("#")[0];
  if (linkHref === currentHref) {
    // add class to enable styled background in CSS and allow transition
    link.classList.add('active');
  }
});

// logo fallback: if JPG not found, swap to embedded SVG and warn
const logoImg = document.getElementById('school-logo');
if (logoImg) {
  logoImg.addEventListener('error', () => {
    console.warn('School logo failed to load from provided path; switching to built-in placeholder.');
    // fallback SVG similar to previous default
    logoImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='60'><rect width='100' height='60' fill='%23002147'/><text x='50' y='35' font-family='Georgia' font-size='20' fill='%23ffcc00' text-anchor='middle'>MAKI</text></svg>";
  });
}

// ========== HOME PAGE ==========

// Hero welcome effect
if (document.querySelector(".hero h2")) {
  const heroTitle = document.querySelector(".hero h2");
  heroTitle.style.opacity = 0;
  setTimeout(() => {
    heroTitle.style.transition = "opacity 2s";
    heroTitle.style.opacity = 1;
  }, 500);
}

// ========== ABOUT PAGE ==========

// Animate values list
if (document.querySelector(".about ul")) {
  const values = document.querySelectorAll(".about ul li");
  values.forEach((item, index) => {
    item.style.opacity = 0;
    setTimeout(() => {
      item.style.transition = "opacity 1s";
      item.style.opacity = 1;
    }, index * 500);
  });
}

// ========== HISTORY PAGE ==========

// Timeline hover effect
if (document.querySelector(".history ul")) {
  document.querySelectorAll(".history ul li").forEach(item => {
    item.addEventListener("mouseover", () => {
      item.style.background = "#e6f0ff";
      item.style.transition = "background 0.3s";
    });
    item.addEventListener("mouseout", () => {
      item.style.background = "transparent";
    });
  });
}

// ========== EVENTS PAGE ==========

// Highlight upcoming events
if (document.querySelector(".events ul")) {
  const today = new Date();
  document.querySelectorAll(".events ul li").forEach(event => {
    const text = event.textContent;
    const dateMatch = text.match(/([A-Za-z]+ \d{1,2}, \d{4})/);
    if (dateMatch) {
      const eventDate = new Date(dateMatch[0]);
      if (eventDate > today) {
        event.style.color = "#004080";
        event.style.fontWeight = "bold";
      }
    }
  });
}

// ========== GALLERY PAGE ==========

const galleryGrid = document.getElementById('gallery-grid');
const galleryCount = document.getElementById('gallery-count');
if (galleryGrid && galleryCount) {
  const galleryItems = [
    { src: 'slab studies.jpg', alt: 'Students studying in a classroom', caption: 'Slab Studying' },
    { src: 'Arty-activity.jpg.jpg', alt: 'Students showing art ideas', caption: 'Art Activity' },
    { src: 'current leaders.jpg', alt: 'Students competing in a sports event', caption: 'Sports Competition' },
    { src: 'computer club.jpg.jpg', alt: 'Students using computers in club', caption: 'Computer Club' },
    { src: 'images/graduation.jpg', alt: 'Graduation ceremony on stage', caption: 'Graduation Ceremony' },
    { src: 'images/library.jpg', alt: 'School library with students reading', caption: 'School Library' },
    { src: 'creating green maki.jpg', alt: 'Student planting a tree for Green Maki project', caption: 'Creating Green Maki' }
  ];

  galleryCount.textContent = `${galleryItems.length} photos in this gallery`;
  galleryGrid.innerHTML = galleryItems.map((item, index) => `
    <figure class="gallery-item">
      <button type="button" class="gallery-thumb" data-index="${index}" aria-label="View ${item.caption}">
        <img src="${item.src}" alt="${item.alt}">
      </button>
      <figcaption>${item.caption}</figcaption>
    </figure>
  `).join('');

  let currentIndex = 0;
  let overlay = null;

  const closeLightbox = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', lightboxKeyHandler);
    }
  };

  let lightboxKeyHandler = event => {
    if (!overlay) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showLightbox((currentIndex - 1 + galleryItems.length) % galleryItems.length);
    if (event.key === 'ArrowRight') showLightbox((currentIndex + 1) % galleryItems.length);
  };

  const showLightbox = index => {
    currentIndex = index;
    const item = galleryItems[currentIndex];

    if (overlay) {
      document.removeEventListener('keydown', lightboxKeyHandler);
      overlay.remove();
    }

    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <div class="lightbox-inner" role="dialog" aria-modal="true" aria-label="${item.caption}">
        <button class="lightbox-close" type="button" aria-label="Close gallery view">×</button>
        <button class="lightbox-arrow lightbox-arrow-left" type="button" aria-label="Previous image">‹</button>
        <img src="${item.src}" alt="${item.alt}" class="lightbox-image">
        <div class="lightbox-caption">${item.caption}</div>
        <button class="lightbox-arrow lightbox-arrow-right" type="button" aria-label="Next image">›</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-arrow-left').addEventListener('click', () => showLightbox((currentIndex - 1 + galleryItems.length) % galleryItems.length));
    overlay.querySelector('.lightbox-arrow-right').addEventListener('click', () => showLightbox((currentIndex + 1) % galleryItems.length));
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', lightboxKeyHandler);
  };

  galleryGrid.querySelectorAll('.gallery-thumb img').forEach(img => {
    img.addEventListener('error', () => {
      const wrapper = img.closest('.gallery-thumb');
      if (wrapper) {
        wrapper.classList.add('gallery-fallback');
        img.style.display = 'none';
        wrapper.innerHTML = `<div class="gallery-placeholder">Image not available: ${img.alt}</div>`;
      }
    });
  });

  galleryGrid.querySelectorAll('.gallery-thumb').forEach(button => {
    button.addEventListener('click', () => showLightbox(Number(button.dataset.index)));
  });
}

// ========== CONTACT PAGE ==========

// Form validation
if (document.querySelector(".contact form")) {
  document.querySelector(".contact form").addEventListener("submit", function(e) {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      alert("Please fill in all fields before sending.");
      e.preventDefault();
    } else {
      alert("Thank you, " + name + "! Your message has been sent.");
    }
  });
}
// dark mode toggle may not exist on every page (bugfix for events.html type typo etc)
const toggleCheckbox = document.getElementById('dark-mode-toggle');
if (toggleCheckbox) {
  // Load preference
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    toggleCheckbox.checked = true;
  }

  // Toggle logic
  toggleCheckbox.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', toggleCheckbox.checked);
    localStorage.setItem('theme', toggleCheckbox.checked ? 'dark' : 'light');
  });
} else {
  console.warn('dark mode toggle checkbox not found on this page');
}

// ========== LANGUAGE TOGGLE (EN <-> SW) ==========
const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.history': 'History',
    'nav.events': 'Events',
    'nav.gallery': 'Gallery',
    'nav.contact': 'Contact',
    'nav.staff': 'Staff',
    'hero.title': 'Welcome to Maki High School',
    'hero.subtitle': 'Empowering students with knowledge, discipline, and creativity since 2007.',
    'legacy.title': 'Our Legacy',
    'legacy.text': 'Maki High School has proudly served the Kilimanjaro region for over four decades. With a tradition of academic excellence and community service, our alumni have gone on to become leaders in education, science, business, and public service.',
    'events.title': 'Upcoming Events',
    'events.item1': '<strong>Jan 15, 2026:</strong> Annual Science Fair showcasing student innovation.',
    'events.item2': '<strong>Feb 10, 2026:</strong> Inter‑school Sports Competition.',
    'events.item3': '<strong>April 10, 2026:</strong> Form Six Graduation Ceremony.',
    'events.item4': '<strong>May 4, 2026:</strong> Form Six National Exam.',
    'events.item5': '<strong>July 8, 2026:</strong> Arrival of New Form Five.',
    'gallery.title': 'Gallery',
    'gallery.text': 'From classrooms to sports fields, our gallery captures the vibrant spirit of Maki High School. Explore photos of student achievements, memorable events, and everyday life at our campus.',
    'footer.copyright': '&copy; 2025 Maki High School',
    'footer.contact': 'Contact: info@makihighschool.edu | Phone: +255 712 345 678',
    'footer.address': 'Address: Mashati Kasurua, Rombo District, Kilimanjaro, Tanzania'
  },
  sw: {
    'nav.home': 'Nyumbani',
    'nav.about': 'Kuhusu',
    'nav.history': 'Historia',
    'nav.events': 'Matukio',
    'nav.gallery': 'Galeri',
    'nav.contact': 'Mawasiliano',
    'nav.staff': 'Walimu',
    'hero.title': 'Karibu Shule ya Maki',
    'hero.subtitle': 'Kuwapa wanafunzi maarifa, nidhamu, na ubunifu tangu 2007.',
    'legacy.title': 'Urithi Wetu',
    'legacy.text': 'Shule ya Maki imehudumia mkoa wa Kilimanjaro kwa zaidi ya miongo minne. Kwa utamaduni wa ubora wa kitaaluma na huduma kwa jamii, wahitimu wetu wamekuwa viongozi katika elimu, sayansi, biashara, na huduma za umma.',
    'events.title': 'Matukio Jijayo',
    'events.item1': '<strong>Jan 15, 2026:</strong> Maonyesho ya Sayansi ya Mwaka yanayoonyesha ubunifu wa wanafunzi.',
    'events.item2': '<strong>Feb 10, 2026:</strong> Mashindano ya michezo baina ya shule.',
    'events.item3': '<strong>April 10, 2026:</strong> Mahafali ya Kidato cha Sita.',
    'events.item4': '<strong>May 4, 2026:</strong> Mtihani wa Taifa wa Kidato cha Sita.',
    'events.item5': '<strong>July 8, 2026:</strong> Uwasili wa Kidato cha Tano Kipya.',
    'gallery.title': 'Galeri',
    'gallery.text': 'Kutoka vyumba vya madarasa hadi viwanja vya michezo, galeri yetu inakamata roho hai ya Shule ya Maki. Tembelea picha za mafanikio ya wanafunzi, matukio ya kukumbukwa, na maisha ya kila siku chuoni kwetu.',
    'footer.copyright': '&copy; 2025 Shule ya Maki',
    'footer.contact': 'Mawasiliano: info@makihighschool.edu | Simu: +255 712 345 678',
    'footer.address': 'Anwani: Mashati Kasurua, Wilaya ya Rombo, Kilimanjaro, Tanzania'
  }
};
// Add missing translation keys for other pages
Object.assign(translations.en, {
  'school.title': 'Maki High School',
  'events.past_title': 'Past Highlights',
  'events.past1': '<strong>Nov 2025:</strong> Graduation Ceremony for Class of 2025',
  'events.past2': '<strong>Oct 2025:</strong> Debate Competition — Maki High ranked 1st',
  'events.past3': '<strong>Sept 2025:</strong> Teachers’ Appreciation Week',
  'about.title': 'About Maki High School',
  'about.text': 'Founded in 2007, Maki High School has been a cornerstone of education in the Kilimanjaro region. Our mission is to nurture students with strong academic foundations, discipline, and creativity, preparing them to contribute meaningfully to society.',
  'about.vision_title': 'Our Vision',
  'about.vision_text': 'To be a leading institution recognized for excellence in academics, innovation, and community service.',
  'about.values_title': 'Our Values',
  'about.value1': 'Integrity and discipline',
  'about.value2': 'Commitment to excellence',
  'about.value3': 'Respect for diversity',
  'about.value4': 'Service to the community',
  'contact.title': 'Reach Us',
  'contact.address': '📍 Mashati Kasurua, Rombo District, Kilimanjaro, Tanzania',
  'contact.phone': '📞 +255 712 345 678',
  'contact.email': '✉️ info@makihighschool.edu',
  'contact.form_title': 'Send Us a Message',
  'contact.placeholder.name': 'Your Name',
  'contact.placeholder.email': 'Your Email',
  'contact.placeholder.message': 'Your Message',
  'contact.send': 'Send Message',
  'history.title': 'Our History',
  'history.text': 'Since its founding in 1978, Maki High School has grown from a small community institution into one of the most respected schools in the Kilimanjaro region.',
  'history.milestones_title': 'Milestones',
  'history.m1': '<strong>1978:</strong> School established with 120 students.',
  'history.m2': '<strong>1985:</strong> First national exam results ranked top 10 in the region.',
  'history.m3': '<strong>1995:</strong> Expansion of science laboratories and library facilities.',
  'history.m4': '<strong>2010:</strong> Introduction of ICT programs and digital learning.',
  'history.m5': '<strong>2020:</strong> Alumni network established, supporting scholarships and mentorship.',
  'staff.login_title': 'Staff Portal Login',
  'staff.login_description': 'Teachers and staff members only. Please enter your password to access the issue reporting system.',
  'staff.password_label': 'Password:',
  'staff.login_button': 'Login',
  'staff.dashboard_title': 'Staff Dashboard',
  'staff.logout_button': 'Logout',
  'staff.report_title': 'Report a School Issue',
  'staff.reporter_name': 'Your Name:',
  'staff.issue_category': 'Issue Category:',
  'staff.category_infrastructure': 'Infrastructure/Facilities',
  'staff.category_academic': 'Academic Concerns',
  'staff.category_discipline': 'Discipline/Behavior',
  'staff.category_resources': 'Learning Resources',
  'staff.category_safety': 'Safety/Health',
  'staff.category_other': 'Other',
  'staff.issue_priority': 'Priority Level:',
  'staff.priority_low': 'Low',
  'staff.priority_medium': 'Medium',
  'staff.priority_high': 'High',
  'staff.priority_urgent': 'Urgent',
  'staff.issue_description': 'Issue Description:',
  'staff.submit_issue': 'Submit Issue',
  'staff.issues_list_title': 'Reported Issues',
  'staff.no_issues': 'No issues reported yet.'
});

Object.assign(translations.sw, {
  'school.title': 'Shule ya Maki',
  'events.past_title': 'Matukio yaliyopita',
  'events.past1': '<strong>Nov 2025:</strong> Sherehe ya Kuhaurisha kwa Darasa la 2025',
  'events.past2': '<strong>Oct 2025:</strong> Mashindano ya mijadala — Shule ya Maki ikaweka nafasi ya 1',
  'events.past3': '<strong>Sept 2025:</strong> Wiki ya Tuzo kwa Walimu',
  'about.title': 'Kuhusu Shule ya Maki',
  'about.text': 'Ilianzishwa mwaka 2007, Shule ya Maki imekuwa nguzo ya elimu katika mkoa wa Kilimanjaro. Dhamira yetu ni kuwalea wanafunzi kwa misingi imara ya kitaaluma, nidhamu, na ubunifu, tukiwaandaa kuchangia jamii kwa maana.',
  'about.vision_title': 'Maono Yetu',
  'about.vision_text': 'Kuwa taasisi inayoongoza inayotambulika kwa ubora katika taaluma, ubunifu, na huduma za jamii.',
  'about.values_title': 'Maadili Yetu',
  'about.value1': 'Uadilifu na nidhamu',
  'about.value2': 'Kujiweka kwa ubora',
  'about.value3': 'Heshima kwa utofauti',
  'about.value4': 'Huduma kwa jamii',
  'contact.title': 'Wasiliana Nasi',
  'contact.address': '📍 Mashati Kasurua, Wilaya ya Rombo, Kilimanjaro, Tanzania',
  'contact.phone': '📞 +255 712 345 678',
  'contact.email': '✉️ info@makihighschool.edu',
  'contact.form_title': 'Tumatumie Ujumbe',
  'contact.placeholder.name': 'Jina Lako',
  'contact.placeholder.email': 'Barua Pepe Yako',
  'contact.placeholder.message': 'Ujumbe Wako',
  'contact.send': 'Tuma Ujumbe',
  'history.title': 'Historia Yetu',
  'history.text': 'Tangu ilipoanzishwa mwaka 1978, Shule ya Maki imekua kutoka kuwa taasisi ndogo ya jamii hadi moja ya shule zinazoheshimika mkoa wa Kilimanjaro.',
  'history.milestones_title': 'Milestones',
  'history.m1': '<strong>1978:</strong> Shule ilianzishwa na wanafunzi 120.',
  'history.m2': '<strong>1985:</strong> Matokeo ya mtihani wa taifa yaliruhusu nafasi ya juu mkoa.',
  'history.m3': '<strong>1995:</strong> Upanuzi wa maabara za sayansi na maktaba.',
  'history.m4': '<strong>2010:</strong> Utangulizi wa programu za ICT na mafundisho ya kidijitali.',
  'history.m5': '<strong>2020:</strong> Mtandao wa wahitimu uliundwa, ukisaidia udhamini na uongozi.',
  'staff.login_title': 'Ingia katika Kituo cha Walimu',
  'staff.login_description': 'Walimu na waajiri tu. Tafadhali ingiza neno la siri kufikia mfumo wa kuripoti matata.',
  'staff.password_label': 'Neno la Siri:',
  'staff.login_button': 'Ingia',
  'staff.dashboard_title': 'Dashboard ya Walimu',
  'staff.logout_button': 'Toka',
  'staff.report_title': 'Ripoti Tatizo la Shule',
  'staff.reporter_name': 'Jina Lako:',
  'staff.issue_category': 'Jamii ya Tatizo:',
  'staff.category_infrastructure': 'Miundombinu/Mifumo',
  'staff.category_academic': 'Matatizo ya Kitaaluma',
  'staff.category_discipline': 'Nidhamu/Tabia',
  'staff.category_resources': 'Rasilimali za Kujifunza',
  'staff.category_safety': 'Usalama/Afya',
  'staff.category_other': 'Nyingine',
  'staff.issue_priority': 'Kiwango cha Haraka:',
  'staff.priority_low': 'Chini',
  'staff.priority_medium': 'Kati',
  'staff.priority_high': 'Juu',
  'staff.priority_urgent': 'Dharura',
  'staff.issue_description': 'Maelezo ya Tatizo:',
  'staff.submit_issue': 'Wasilisha Tatizo',
  'staff.issues_list_title': 'Matatizo Yaliyoripotiwa',
  'staff.no_issues': 'Hakuna matatizo yaliyoripotiwa bado.'
});

// Add full-slide translation keys (HTML allowed) so slides translate as a block
Object.assign(translations.en, {
  'history.slide1': `<h3>Title</h3><h1>The History of MAKI Secondary School</h1><p class="lead">From Two Villages to Academic Excellence</p>`,
  'history.slide2': `<h3>The Founding of MAKI Secondary School (2007)</h3><p>In the heart of Kilimanjaro, where the spirit of education meets the strength of community, MAKI Secondary School was born in 2007. Its name is a proud blend of two villages—Marangu and Kitowo—symbolizing unity, vision, and hope for future generations.</p><ul><li><strong>5 dedicated teachers</strong>: Mr. Mtengeti, Mr. Ndesa, Headmaster Desderi Peter Mushi, Ms. Juliana Masawe, and Mr. Juma Manase</li><li><strong>102 eager students</strong>, full of dreams and determination</li><li><strong>Two classroom blocks</strong> — yet a world of possibilities</li></ul><p>Despite facing serious challenges—water scarcity, limited teaching staff, and insufficient academic materials—the school stood firm. It was not just a place of learning, but a symbol of resilience and the belief that education could transform lives.</p><blockquote>"From humble beginnings, MAKI planted the seeds of greatness."</blockquote>`,
  'history.slide3': `<h3>Rising from Challenges (2007–2020)</h3><p>In its early years, MAKI Secondary School faced daunting obstacles. With only two classroom blocks and a handful of passionate teachers, the school struggled against the odds. Water shortages, a lack of teaching staff, and limited academic materials made learning difficult—but not impossible.</p><p>In 2010, the school constructed its first science laboratory, marking a new era of hands-on learning, especially in Chemistry and Biology.</p><p>In 2020, the arrival of field teachers brought fresh energy and expertise. Among them was Sir Vitus Mwanankulu, whose dedication to teaching Chemistry sparked a transformation. His impact was recognized with a certificate of excellence by the Minister of Education, Adolf Mkenda.</p><blockquote>"One teacher can ignite a thousand minds—and Sir Vitus did just that."</blockquote>`,
  'history.slide4': `<h3>A New Chapter Begins (2020–2024)</h3><p>As MAKI's academic reputation grew, so did its ambition. The school was becoming a beacon of excellence in the Kilimanjaro region.</p><p>In 2024, MAKI introduced Advanced Level (Form Five) studies, made possible through the advocacy of Dr. Steve Moshi, who convinced the Minister of Education to approve the upgrade.</p><p><strong>Why MAKI?</strong></p><ul><li>Large and fertile campus, ideal for growth</li><li>Functional rainwater collection system, solving past water challenges</li><li>Proven record of academic improvement, especially in sciences</li></ul><p>The first Form Five class welcomed <strong>66 students</strong>—33 boys and 33 girls—marking a new era of opportunity and leadership.</p><blockquote>"From a modest beginning to shaping future leaders—MAKI stepped boldly into the future."</blockquote>`,
  'history.slide5': `<h3>Sports & Student Life</h3><p>Beyond academics, MAKI Secondary School has cultivated a vibrant culture of sports, discipline, and student leadership. The school is known for smart minds and strong bodies.</p><p>Recent achievements:</p><ul><li>3 students selected for district-level football in the UMISETA competition</li><li>1 student represented the school in regional-level basketball</li></ul><p>Challenges remain: seasonal water shortages and limited sports infrastructure (especially basketball and handball).</p><blockquote>"MAKI students don't just compete—they inspire."</blockquote>`,
  'history.slide6': `<h3>Vision for the Future</h3><p>MAKI continues to grow in academics, sports, and leadership. The Scout movement is a proud pillar where students learn responsibility, teamwork, and service.</p><p>Key goals:</p><ul><li>Expand sports grounds, especially for basketball and handball</li><li>Improve seasonal water access through sustainable systems</li><li>Maintain high academic performance</li><li>Strengthen leadership programs like Scouts and student government</li></ul><p>"MAKI is more than a school—it's a movement of minds, hearts, and hands."</p>`
});

Object.assign(translations.sw, {
  'history.slide1': `<h3>Kichwa</h3><h1>Historia ya Shule ya Sekondari MAKI</h1><p class="lead">Kutoka Vijiji Viwili hadi Ubora wa Kitaaluma</p>`,
  'history.slide2': `<h3>Uanzishaji wa Shule ya Sekondari MAKI (2007)</h3><p>Katikati ya Kilimanjaro, ambapo roho ya elimu inakutana na nguvu ya jamii, Shule ya Sekondari MAKI ilianzishwa mwaka 2007. Jina lake ni mchanganyiko wa vijiji viwili—Marangu na Kitowo—likiashiria umoja, maono, na matumaini kwa vizazi vijavyo.</p><ul><li><strong>Walimu 5 waliojitolea</strong>: Mr. Mtengeti, Mr. Ndesa, Mkurugenzi Desderi Peter Mushi, Ms. Juliana Masawe, na Mr. Juma Manase</li><li><strong>Wanafunzi 102</strong>, wakiwa na ndoto na ari</li><li><strong>Vibanda viwili vya madarasa</strong> — ila vilivyojaa uwezekano</li></ul><p>Kwa kuwa na changamoto kama uhaba wa maji, ukosefu wa walimu, na vifaa duni za kufundishia, shule ilibaki imara—ikawa ishara ya ustahimilivu na imani ya mabadiliko kupitia elimu.</p><blockquote>"Kutokana na mwanzo mdogo, MAKI ilipanda mbegu za ukuu."</blockquote>`,
  'history.slide3': `<h3>Kupanda kutoka kwa Changamoto (2007–2020)</h3><p>Miaka ya mwanzo, Shule ya MAKI ilikumbana na changamoto kubwa. Kwa vibanda viwili na walimu wachache, shule ilikumbana na vizingiti. Uhaba wa maji, ukosefu wa walimu, na vifaa duni vilifanya kujifunza kuwa vigumu—lakini si vigumu mno.</p><p>Mwaka 2010, shule ilijenga maabara ya kwanza ya sayansi, kuanzisha kipindi cha kujifunza kwa vitendo hasa katika Kemia na Biolojia.</p><p>Mwaka 2020, walimu wa uwanja walijitokeza kuleta ari na ujuzi. Miongoni mwao alikuwa Sir Vitus Mwanankulu, aliyekuwa na mchango mkubwa katika kufundisha Kemia na alipata cheti cha utukufu kutoka kwa Waziri wa Elimu, Adolf Mkenda.</p><blockquote>"Mwalimu mmoja anaweza kuwasha akili elfu—na Sir Vitus alifanya hivyo."</blockquote>`,
  'history.slide4': `<h3>Sura Mpya Inaanza (2020–2024)</h3><p>Uzito wa umaarufu wa kitaaluma wa MAKI uliongezeka, hivyo ndivyo matarajio yalivyoongezeka. Shule ikawa taa ya ubora katika mkoa wa Kilimanjaro.</p><p>Mwaka 2024, MAKI ilianzisha masomo ya Kidato cha Tano (Advanced Level), kupitia uamuzi wa Dr. Steve Moshi aliyemshawishi Waziri wa Elimu kuidhinisha uboreshaji.</p><p><strong>Kwanini MAKI?</strong></p><ul><li>Uwanja mkubwa na wenye rutuba, mzuri kwa maendeleo</li><li>Mfumo wa kukusanya maji ya mvua unaofanya kazi, ukitatua matatizo ya maji</li><li>Rekodi ya kuboresha kitaaluma, hasa katika sayansi</li></ul><p>Darasa la kwanza la Kidato cha Tano lilikaribisha <strong>wanafunzi 66</strong>—wavulana 33 na wasichana 33—ikileta fursa na uongozi.</p><blockquote>"Kutoka mwanzo mdogo hadi kuunda viongozi wa baadaye—MAKI ilichukua hatua kwa ujasiri kuelekea siku za usoni."</blockquote>`,
  'history.slide5': `<h3>Michezo na Maisha ya Wanafunzi</h3><p>Mbali na taaluma, MAKI imeendeleza utamaduni wa michezo, nidhamu, na uongozi wa wanafunzi. Shule inajulikana kwa akili na miili imara.</p><p>Mafanikio ya hivi karibuni:</p><ul><li>Wanafunzi 3 walichaguliwa kwa timu ya wilaya katika mashindano ya UMISETA</li><li>Mwanafunzi 1 aliwakilisha shule kwenye mchezo wa kikapu wa ngazi ya mkoa</li></ul><p>Changamoto zinaendelea: uhaba wa maji msimu na miundombinu ya michezo duni (hasa kikapu na mpira wa mikono).</p><blockquote>"Wanafunzi wa MAKI hawashindani tu—wanatoa msukumo."</blockquote>`,
  'history.slide6': `<h3>Maono ya Baadaye</h3><p>MAKI inaendelea kukua katika taaluma, michezo, na uongozi. Harakati za Skauti ni nguzo muhimu ambapo wanafunzi hujifunza uwajibikaji, kazi ya pamoja, na huduma kwa jamii.</p><p>Malengo muhimu:</p><ul><li>Kupanua uwanja wa michezo, hasa kwa kikapu na mpira wa mikono</li><li>Kuboresha upatikanaji wa maji msimu kwa mifumo endelevu</li><li>Kudumisha utendaji wa juu kitaaluma</li><li>Kukuza programu za uongozi kama Skauti na serikali ya wanafunzi</li></ul><p>"MAKI siyo tu shule—ni harakati ya akili, mioyo, na mikono."</p>`
});

function applyTranslations(lang) {
  // innerHTML/text translations with a short fade/slide animation
  function stripTags(s) { return s.replace(/<[^>]*>/g, ''); }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const html = (translations[lang] && translations[lang][key]) || (translations['en'][key]) || el.innerHTML;
    // animate out
    el.style.transition = 'opacity 220ms ease, transform 220ms ease';
    el.style.opacity = 0;
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
        el.value = stripTags(html);
      } else if (el.tagName.toLowerCase() === 'button') {
        el.textContent = stripTags(html);
      } else {
        el.innerHTML = html;
      }
      // animate in
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }, 220);
  });

  // placeholder translations
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const text = (translations[lang] && translations[lang][key]) || (translations['en'][key]) || el.getAttribute('placeholder') || '';
    el.setAttribute('placeholder', text);
  });

  // update segmented UI if present (active class + parent data attribute for sliding indicator)
  document.querySelectorAll('.lang-segment').forEach(segment => {
    segment.setAttribute('data-lang', lang);
    segment.querySelectorAll('.lang-option').forEach(b => {
      const isActive = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      b.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  });
}

let currentLang = localStorage.getItem('lang') || 'en';
applyTranslations(currentLang);

// segmented language control handlers
document.querySelectorAll('.lang-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    if (!lang) return;
    currentLang = lang;
    localStorage.setItem('lang', currentLang);
    applyTranslations(currentLang);
  });
  // keyboard support
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});

// Slideshow removed — history displays as normal content now.

// ========== STAFF PORTAL ==========

// Staff portal password (Change this to your desired password)
const STAFF_PASSWORD = 'maki2024';

// Initialize staff portal
function initStaffPortal() {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const issueForm = document.getElementById('issue-form');

  if (!loginForm && !issueForm) return; // Not on staff page

  // Check if already logged in
  if (sessionStorage.getItem('staffLoggedIn') === 'true') {
    showStaffDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleStaffLogin);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleStaffLogout);
  }

  if (issueForm) {
    issueForm.addEventListener('submit', handleIssueSubmit);
  }

  // Load and display existing issues
  displayIssues();
}

function handleStaffLogin(e) {
  e.preventDefault();
  const password = document.getElementById('staff-password').value;
  const errorDiv = document.getElementById('login-error');

  if (password === STAFF_PASSWORD) {
    sessionStorage.setItem('staffLoggedIn', 'true');
    errorDiv.style.display = 'none';
    showStaffDashboard();
  } else {
    errorDiv.textContent = currentLang === 'sw' ? 
      'Neno la siri sio sahihi. Tafadhali jaribu tena.' : 
      'Incorrect password. Please try again.';
    errorDiv.style.display = 'block';
  }
}

function handleStaffLogout() {
  sessionStorage.removeItem('staffLoggedIn');
  document.getElementById('staff-dashboard').style.display = 'none';
  document.getElementById('staff-login').style.display = 'block';
  document.getElementById('login-form').reset();
}

function showStaffDashboard() {
  document.getElementById('staff-login').style.display = 'none';
  document.getElementById('staff-dashboard').style.display = 'block';
}

function handleIssueSubmit(e) {
  e.preventDefault();

  const issue = {
    id: Date.now(),
    name: document.getElementById('issue-name').value,
    category: document.getElementById('issue-category').value,
    categoryLabel: document.getElementById('issue-category').options[document.getElementById('issue-category').selectedIndex].text,
    priority: document.getElementById('issue-priority').value,
    description: document.getElementById('issue-description').value,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  };

  // Get existing issues from localStorage
  let issues = JSON.parse(localStorage.getItem('schoolIssues')) || [];
  issues.push(issue);
  localStorage.setItem('schoolIssues', JSON.stringify(issues));

  // Show success message
  const successDiv = document.getElementById('issue-success');
  successDiv.textContent = currentLang === 'sw' ? 
    'Tatizo limewasilishwa kwa mafanikio!' : 
    'Issue submitted successfully!';
  successDiv.style.display = 'block';

  // Reset form
  document.getElementById('issue-form').reset();

  // Reload issues display
  setTimeout(() => {
    displayIssues();
    successDiv.style.display = 'none';
  }, 2000);
}

function displayIssues() {
  const issuesList = document.getElementById('issues-list');
  if (!issuesList) return;

  const issues = JSON.parse(localStorage.getItem('schoolIssues')) || [];

  if (issues.length === 0) {
    issuesList.innerHTML = '<p class="no-issues" data-i18n="staff.no_issues">No issues reported yet.</p>';
    applyTranslations(currentLang);
    return;
  }

  // Sort issues by date (most recent first)
  issues.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

  issuesList.innerHTML = issues.map(issue => `
    <div class="issue-card">
      <div class="issue-header">
        <div class="issue-title">${escapeHtml(issue.categoryLabel)}</div>
        <div class="issue-priority ${issue.priority}">${issue.priority.toUpperCase()}</div>
      </div>
      <div class="issue-meta">
        <span><strong>Reporter:</strong> ${escapeHtml(issue.name)}</span>
        <span><strong>Date:</strong> ${issue.date} ${issue.time}</span>
      </div>
      <div class="issue-description">${escapeHtml(issue.description)}</div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize staff portal when page loads
document.addEventListener('DOMContentLoaded', initStaffPortal);

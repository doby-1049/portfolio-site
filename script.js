/* ==========================================================
   星野ウェブ制作 LP — script.js

   このファイルでは、次の3つの機能を作っています。
     1. ハンバーガーメニューの開閉（スマホ表示）
     2. ページ内リンクのスムーズスクロール
     3. スクロールに応じたフェードイン表示

   index.html の </body> の直前で読み込みます。
     <script src="script.js"></script>
   ========================================================== */

// 'use strict' をつけると、書き間違い（変数の宣言忘れなど）をエラーで教えてくれます
'use strict';


/* ==========================================================
   0. 共通で使う部品を、最初にまとめて取得しておく
   ----------------------------------------------------------
   document.querySelector('.クラス名') で、HTMLの中から
   該当する要素を1つ取り出せます。
   ========================================================== */

// ヘッダー全体（スクロール位置の計算で、高さを使います）
const header = document.querySelector('.header');

// ハンバーガーボタン（三本線のボタン）
const menuButton = document.querySelector('.header__toggle');

// ナビゲーション（メニューの中身）
const menuNav = document.querySelector('.header__nav');

// 「動きを減らしたい」という端末設定があるかどうか（true / false）
// 酔いやすい人などへの配慮として、設定がある場合はアニメーションを控えます
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ==========================================================
   1. ハンバーガーメニューの開閉
   ----------------------------------------------------------
   仕組み：
   「開く」ときに .is-open というクラスをHTMLに付け、
   「閉じる」ときにそのクラスを外します。
   見た目の変化（スライドして表示される動き）は、
   style.css の .is-open の記述が担当しています。
   ========================================================== */

// メニューを「開く」関数
function openMenu() {
  menuButton.classList.add('is-open');   // 三本線を「×」の形にする
  menuNav.classList.add('is-open');      // メニューを表示する
  document.body.classList.add('is-menu-open'); // 背景のスクロールを止める

  // スクリーンリーダー（読み上げソフト）向けに、状態を伝える
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'メニューを閉じる');
}

// メニューを「閉じる」関数
function closeMenu() {
  menuButton.classList.remove('is-open');
  menuNav.classList.remove('is-open');
  document.body.classList.remove('is-menu-open'); // 背景のスクロールを再開する

  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'メニューを開く');
}

// ボタンやメニューが見つかったときだけ、以下の処理を設定する
// （HTMLの書き間違いがあっても、他の機能まで止まらないようにするため）
if (menuButton && menuNav) {

  // (1) ハンバーガーボタンをクリックしたら、開閉を切り替える
  menuButton.addEventListener('click', function () {
    // いま開いているなら閉じる、閉じているなら開く
    if (menuNav.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // (2) メニュー内のリンクをクリックしたら、自動でメニューを閉じる
  // querySelectorAll は、該当する要素を「全部」取り出します
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // (3) Escキーを押したら、メニューを閉じる（キーボード操作への配慮）
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  // (4) 画面幅がPCサイズ（769px以上）になったら、メニューを閉じる
  // スマホでメニューを開いたまま画面を横向きにした、などの対策です
  const desktopQuery = window.matchMedia('(min-width: 769px)');
  desktopQuery.addEventListener('change', function (event) {
    if (event.matches) {
      closeMenu();
    }
  });
}


/* ==========================================================
   2. スムーズスクロール
   ----------------------------------------------------------
   href が「#」で始まるリンク（例：#features）をクリックしたとき、
   一瞬でジャンプするのではなく、なめらかに移動させます。
   ========================================================== */

// 「#」で始まるリンクを、ページ内からすべて取り出す
const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach(function (anchor) {
  anchor.addEventListener('click', function (event) {

    // クリックしたリンクの行き先（例："#features"）を取得
    const href = anchor.getAttribute('href');

    // 移動先のスクロール位置（初期値は、ページの一番上＝0）
    let targetPosition = 0;

    // href が「#」だけではない場合は、移動先のセクションを探す
    if (href !== '#') {
      const target = document.querySelector(href);

      // 移動先が見つからなければ、何もせず終了（普通のリンク動作に任せる）
      if (!target) {
        return;
      }

      // 移動先の位置を計算する
      //   getBoundingClientRect().top … いまの画面の上端から、対象までの距離
      //   window.pageYOffset          … いまのスクロール量
      //   header.offsetHeight         … 固定ヘッダーの高さ（見出しが隠れないように引く）
      targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight;
    }

    // ブラウザ標準のジャンプ動作を止める（このあと自分でスクロールさせるため）
    event.preventDefault();

    // スマホのメニューが開いていたら、先に閉じる
    // （メニュー表示中は背景がスクロールできないので、閉じてから動かす）
    if (menuNav && menuNav.classList.contains('is-open')) {
      closeMenu();
    }

    // 指定の位置まで、なめらかにスクロールする
    // 「動きを減らす」設定のときは、ふつうに移動する（'auto'）
    window.scrollTo({
      top: targetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });
});


/* ==========================================================
   3. スクロールに応じたフェードイン表示（Intersection Observer）
   ----------------------------------------------------------
   Intersection Observer は、「この要素が画面に入ったかどうか」を
   自動で見張ってくれる、ブラウザの標準機能です。

   流れ：
     ① 対象の要素に .fade-in を付ける  → 透明＆少し下にずれた状態になる
     ② 画面に入ったら .is-visible を付ける → ふわっと元の位置に戻る
   ========================================================== */

// フェードインさせたい要素のクラス名を、カンマ区切りで並べる
// 増やしたい・減らしたいときは、ここを書き換えるだけでOKです
const fadeTargets = document.querySelectorAll(
  '.section__title, .section__lead, .card, .service, .services__note, .form'
);

// 古いブラウザなど、Intersection Observer が使えない環境では何もしない
// （その場合は、フェードインなしで普通に表示されます）
if ('IntersectionObserver' in window) {

  // 見張り番（Observer）を作る
  // 第1引数：画面に入った・出たときに実行する処理
  // 第2引数：見張り方の設定
  const observer = new IntersectionObserver(
    function (entries, observerSelf) {
      entries.forEach(function (entry) {

        // isIntersecting が true なら、その要素が画面に入った
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible'); // ふわっと表示させる
          observerSelf.unobserve(entry.target);     // 一度表示したら、見張りをやめる
        }
      });
    },
    {
      threshold: 0.15,                  // 要素の15%が見えたら「入った」と判定する
      rootMargin: '0px 0px -40px 0px'   // 画面の下端から40px手前で判定する（早すぎる発火を防ぐ）
    }
  );

  // 対象の要素ひとつひとつに、.fade-in を付けて、見張りを開始する
  fadeTargets.forEach(function (target) {
    target.classList.add('fade-in');
    observer.observe(target);
  });
}

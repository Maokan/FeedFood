import Popup from 'reactjs-popup';
import React from 'react';
import NewPost from '../posts/NewPost';
export default function FeedHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-5 border-b border-bordercol bg-panel px-10 py-3">
      <div className="whitespace-nowrap bg-linear-to-r from-brandred to-brandyellow bg-clip-text text-2xl font-extrabold tracking-wide text-transparent">
        FeedFood
      </div>

      <div className="relative hidden w-72 md:block">
        <i
          className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-dimtext"
          aria-hidden="true"
        />
        <input
          className="w-full rounded-full border border-bordercol bg-panellight py-2 pl-9 pr-4 text-sm text-cream outline-none placeholder:text-dimtext focus:border-brandyellow"
          type="text"
          placeholder="Rechercher un plat, un utilisateur..."
          aria-label="Recherche"
          readOnly
        />
      </div>

      <nav className="flex items-center gap-6 text-xl" aria-label="Navigation principale">
        <span className="inline-flex transition-transform hover:scale-110" title="Accueil">
          <i className="fa-solid fa-house" aria-hidden="true" />
        </span>
        <span className="inline-flex transition-transform hover:scale-110" title="Explorer">
          <i className="fa-solid fa-compass" aria-hidden="true" />
        </span>
        <span className="inline-flex transition-transform hover:scale-110" title="Créer un post (bientôt)">
          
          <Popup trigger=
                {<i className="fa-solid fa-square-plus" aria-hidden="true" />} 
                modal nested>
                {
                    close => (
                        <div className='modal'>
                            <NewPost/>
                            <div>
                                <button onClick=
                                    {() => close()}>
                                        Fermer
                                </button>
                            </div>
                        </div>
                    )
                }
            </Popup>
        </span>
        <span
          className="inline-flex text-brandred transition-transform hover:scale-110"
          title="Le fil brûlant"
        >
          
          <i className="fa-solid fa-fire" aria-hidden="true" />
        </span>
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-bordercol bg-panellight text-sm text-dimtext"
          title="Se connecter (bientôt)"
        >
          <i className="fa-solid fa-user" aria-hidden="true" />
        </span>
      </nav>
    </header>
  );
}

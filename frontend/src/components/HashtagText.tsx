import { Fragment } from 'react';

interface HashtagTextProps {
  text: string;
}

/** Affiche un texte en colorant en jaune les mots commençant par "#". */
export default function HashtagText({ text }: HashtagTextProps) {
  return (
    <>
      {text.split(/(\s+)/).map((word, index) =>
        word.startsWith('#') ? (
          <span key={index} className="text-brandyellow">
            {word}
          </span>
        ) : (
          <Fragment key={index}>{word}</Fragment>
        ),
      )}
    </>
  );
}

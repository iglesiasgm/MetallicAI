import { FaSkull } from "react-icons/fa";

export default function CreateBandHeader({
  titleClassName,
}: {
  titleClassName?: string;
}) {
  return (
    <header className="text-center mb-8">
      <div className="inline-flex items-center justify-center gap-3 mb-3">
        <h2
          className={`${
            titleClassName ?? ""
          } text-3xl sm:text-4xl text-red-500`}
        >
          FORJA UNA NUEVA BANDA
        </h2>
      </div>

      <p className="text-gray-300/80 text-base sm:text-lg">
        Agrega una nueva banda a la base de datos y deja que la IA la incluya en
        sus recomendaciones
      </p>
    </header>
  );
}

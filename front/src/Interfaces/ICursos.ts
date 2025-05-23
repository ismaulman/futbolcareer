export interface ICurso {
    id:string;
    image: string;
    title: string;
    description:string;
    category: CategoryCursos;
    country: string;
    language: string;
    modality: string;
    contact: string;
}

export enum CategoryCursos {
    Curso = "Curso",
    Master = "Master",
    Seminario = "Seminario",
    Diplomatura = "Diplomatura",
    Pruebas = "Pruebas",
    Tryouts = "Tryouts"
}

export interface ICreateCurso {
    image: string;
    title: string;
    description:string;
    category: CategoryCursos;
    country: string;
    language: string;
    modality: string;
    contact: string;
}
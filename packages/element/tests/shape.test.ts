import { describe, beforeEach, test, vi, expect } from "vitest";
import { modifyIframeLikeForRoughOptions } from "@excalidraw/element/shape";
import { isIframeLikeElement, isEmbeddableElement, isIframeElement } from "@excalidraw/element/typeChecks";
import { isTransparent } from "@excalidraw/common";
import { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

vi.mock("../src/typeChecks", async () => {
const actual = await vi.importActual<any>("../src/typeChecks");
return {
    ...actual,
    isIframeLikeElement: vi.fn(),
    isEmbeddableElement: vi.fn(),
    isIframeElement: vi.fn(),
};
});

vi.mock("@excalidraw/common", async () => {
const actual = await vi.importActual<any>("@excalidraw/common");
return {
    ...actual,
    isTransparent: vi.fn(),
};
});

const iframeLikeMock = isIframeLikeElement as unknown as ReturnType<typeof vi.fn>;
const embeddableMock = isEmbeddableElement as unknown as ReturnType<typeof vi.fn>;
const iframeMock = isIframeElement as unknown as ReturnType<typeof vi.fn>;
const transparentMock = isTransparent as ReturnType<typeof vi.fn>;

describe("modifyIframeLikeForRoughOptions", () => {
beforeEach(() => {
    vi.clearAllMocks();
});

test("CT1 - Iframe-Like Elegível Completo", () => {
    const element = {
    id: "el1",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;

    iframeLikeMock.mockReturnValue(true);
    embeddableMock.mockReturnValue(true);
    transparentMock.mockReturnValue(true);

    const result = modifyIframeLikeForRoughOptions(element, true, new Map());

    expect(result).toMatchObject({
    roughness: 0,
    backgroundColor: "#d3d3d3",
    fillStyle: "solid",
    });
});

test("CT2 - Iframe-Like: Condição CD1 Falsa", () => {
    const element = {
    id: "el2",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "rgba(0,0,0,0)",
    } as NonDeletedExcalidrawElement;

    iframeLikeMock.mockReturnValue(false);

    const result = modifyIframeLikeForRoughOptions(element, true, new Map());

    expect(result).toBe(element);
});

test("CT3 - Background Opaco (CD5 Falsa)", () => {
    const element = {
    id: "el3",
    backgroundColor: "#FFF",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(true);
    embeddableMock.mockReturnValue(true);
    transparentMock.mockReturnValueOnce(false).mockReturnValueOnce(true);

    const result = modifyIframeLikeForRoughOptions(element, true, new Map());
    expect(result).toBe(element);
});

test("CT4 - Stroke Opaco (CD6 Falsa)", () => {
    const element = {
    id: "el4",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "#000",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(true);
    embeddableMock.mockReturnValue(true);
    transparentMock.mockReset();
    transparentMock.mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValue(false); 
    iframeMock.mockReturnValue(false);

    const result = modifyIframeLikeForRoughOptions(element, true, new Map());
    expect(result).toEqual(element);
});

test("CT5 - Exportação Falsa e Embed Inválido (CD2, CD4 Falsas)", () => {
    const element = {
    id: "el5",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(true);
    embeddableMock.mockReturnValue(true);
    transparentMock.mockReturnValue(true);
    const map = new Map();
    map.set("el5", true);

    const result = modifyIframeLikeForRoughOptions(element, false, map);
    expect(result).toBe(element);
});

test("CT6 - Exportação Verdadeira com Embed Inválido", () => {
    const element = {
    id: "el6",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(true);
    embeddableMock.mockReturnValue(true);
    transparentMock.mockReturnValue(true);
    iframeMock.mockReturnValue(false);
    const map = new Map();
    map.set("el6", true);

    const result = modifyIframeLikeForRoughOptions(element, true, map);

    expect(result).toMatchObject({
    roughness: 0,
    backgroundColor: "#d3d3d3",
    fillStyle: "solid",
    });
});

test("CT7 - Iframe-Like: Não Embeddable, Exportação Falsa", () => {
    const element = {
    id: "el7",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(true);
    embeddableMock.mockReturnValue(false);
    transparentMock.mockReturnValue(true);

    const result = modifyIframeLikeForRoughOptions(element, false, new Map());
    expect(result).toBe(element);
});

test("CT8 - Exportação Falsa, Embed Válido", () => {
    const element = {
    id: "el8",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(true);
    embeddableMock.mockReturnValue(true);
    transparentMock.mockReturnValue(true);
    const map = new Map();
    map.set("el8", false);

    const result = modifyIframeLikeForRoughOptions(element, false, map);
    expect(result).toMatchObject({
    roughness: 0,
    backgroundColor: "#d3d3d3",
    fillStyle: "solid",
    });
});

test("CT9 - Não é Iframe (else if não entra)", () => {
    const element = {
    id: "el9",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(false);
    iframeMock.mockReturnValue(false);

    const result = modifyIframeLikeForRoughOptions(element, false, new Map());
    expect(result).toBe(element);
});

test("CT10 - Iframe: Stroke e Background Transparentes", () => {
    const element = {
    id: "el10",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(false);
    iframeMock.mockReturnValue(true);
    transparentMock.mockReturnValueOnce(true).mockReturnValueOnce(true);

    const result = modifyIframeLikeForRoughOptions(element, false, new Map());
    expect(result).toMatchObject({
    strokeColor: "#000000",
    backgroundColor: "#f4f4f6",
    });
});

test("CT11 - Iframe: Stroke Transparente, Background Opaco", () => {
    const element = {
    id: "el11",
    backgroundColor: "#FFF",
    strokeColor: "rgba(0,0,0,0)",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(false);
    iframeMock.mockReturnValue(true);
    transparentMock.mockReturnValueOnce(true).mockReturnValueOnce(false);

    const result = modifyIframeLikeForRoughOptions(element, false, new Map());
    expect(result).toMatchObject({
    strokeColor: "#000000",
    backgroundColor: "#FFF",
    }) as unknown as NonDeletedExcalidrawElement;
});

test("CT12 - Iframe: Stroke Opaco, Background Transparente", () => {
    const element = {
    id: "el12",
    backgroundColor: "rgba(0,0,0,0)",
    strokeColor: "#000",
    } as unknown as NonDeletedExcalidrawElement;
    iframeLikeMock.mockReturnValue(false);
    iframeMock.mockReturnValue(true);
    transparentMock.mockReturnValueOnce(false).mockReturnValueOnce(true);

    const result = modifyIframeLikeForRoughOptions(element, false, new Map());
    expect(result).toMatchObject({
    strokeColor: "#000",
    backgroundColor: "#f4f4f6",
    });
});

test("CT13 - Iframe: Stroke e Background Opacos", () => {
    const element = {
    id: "el13",
    backgroundColor: "#FFF",
    strokeColor: "#000000",
    } as unknown as NonDeletedExcalidrawElement;

    iframeLikeMock.mockReturnValue(false);
    iframeMock.mockReturnValue(true);
    transparentMock.mockReturnValue(false);

    const result = modifyIframeLikeForRoughOptions(element, false, new Map());
    expect(result).toMatchObject({
    strokeColor: "#000000",
    backgroundColor: "#FFF",
    });
});
});

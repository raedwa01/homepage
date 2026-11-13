// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function makeRaindropsResponse({ _id: collectionId, title, count}) {
  const items = Array.from({ length: count}, (_, index) => {
    const number = index + 1;
    const bookmarkId = collectionId * 1000 + number;
    const created = "2025-05-03T06:00:23.229Z";

    return {
      _id: bookmarkId,
      title: `${title} Bookmark ${number}`,
      type: "link",
      link: `https://example.com/collections/${collectionId}/bookmarks/${number}`,
      domain: "example.com",
      collection: { $ref: "collections", $id: collectionId, oid: collectionId },
      collectionId,
      created,
      lastUpdate: created,
      tags: [],
      important: false,
      removed: false,
    };
  });
  return { result: true, items, count: items.length, collectionId };
}

function makeRaindropsByCollection(responses) {
  const collections = [...responses.collections.items, ...responses.childCollections.items];
  return new Map(
    collections.map((collection) => [collection._id, makeRaindropsResponse(collection)]),
  );
}

describe("widgets/raindrop.io/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "raindropio" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("raindropio.rootCollections")).toBeInTheDocument();
    expect(screen.getByText("raindropio.collections")).toBeInTheDocument();
    expect(screen.getByText("raindropio.childCollections")).toBeInTheDocument();
    expect(screen.getByText("raindropio.totalCollections")).toBeInTheDocument();
  });

  it.each(["user", "collections", "childCollections"])(
    "renders error UI when %s errors",
    (endpoint) => {
      useWidgetAPI.mockImplementation((_widget, endpointName) => {
        if (endpointName === endpoint) return { data: undefined, error: { message: "nope" } };
        return { data: undefined, error: undefined };
      });

    renderWithProviders(<Component service={{ widget: { type: "raindropio" } }} />, {
      settings: { hideErrors: false },
    });

      expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
      expect(screen.getByText("nope")).toBeInTheDocument();
    },
  );

  it("renders the group and collection counts", () => {
    const responses = {
        user: {
            result: true,
            user: {
                groups: [
                    {
                        title: "My Collections",
                        collections: [ 1, 2, 3]
                    },
                ],
            },
        },
        collections: {
            result: true,
            items: [
                {
                    _id: 1,
                    title: "Collection 1",
                    count: 5,
                },
                {
                    _id: 2,
                    title: "Collection 2",
                    count: 3,
                },
                {
                    _id: 3,
                    title: "Collection 3",
                    count: 2,
                }
            ],
        },
        childCollections: {
            result: true,
            items: [
                {
                    _id: 4,
                    title: "Child Collection 1",
                    count: 1,
                },
                {
                    _id: 5,
                    title: "Child Collection 2",
                    count: 6,
                },
                {
                    _id: 6,
                    title: "Child Collection 3",
                    count: 4,
                }
            ],
        },
    };
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      return { data: responses[endpoint], error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "raindropio" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "raindropio.rootCollections", 1);
    expectBlockValue(container, "raindropio.collections", 3);
    expectBlockValue(container, "raindropio.childCollections", 3);
    expectBlockValue(container, "raindropio.totalCollections", 6);
  });
});

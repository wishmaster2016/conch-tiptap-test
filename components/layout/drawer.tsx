// Props for Sidebar

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Menu,
  Item,
  Separator,
  Submenu,
  useContextMenu,
} from "react-contexify";
import { useInputModal } from "../app-home/utils/input-modal";
import { makePostRequest } from "../../utils/requests";
import { SECOND_BACKEND_URL } from "../../utils/constants";
import {
  FaPlus,
  FaQuestionCircle,
  FaRegTrashAlt,
  FaTrash,
  FaTrashAlt,
} from "react-icons/fa";
import Tooltip from "../shared/tooltip";
import { isMobile } from "react-device-detect";

interface DrawerProps {
  isOpen: boolean;
  closeDrawer: () => void;
  openDocument: (documentData: Record<string, any>) => void;
  foldersWithEssays: Record<string, any>;
  setFoldersWithEssays: (folders: Record<string, any>) => void;
  essaysWithoutFolders: Record<string, any>[];
  setEssaysWithoutFolders: (essays: Record<string, any>[]) => void;
  currDocument: Record<string, any>;
  setCurrDocument: (doc: Record<string, any>) => void;
  createType: string;
  setCreateType: (type: string) => void;
  setShowInputModal: (show: boolean) => void;
  input: string;
  setInput: (input: string) => void;
  setDefaultTextHTML: (text: string) => void;
}

/**
 * IMPORTANT NOTE: Document on Frontend, Essay on Backend (but refer to same entity, for now)
 */
export default function Drawer({
  isOpen,
  closeDrawer,
  openDocument,
  foldersWithEssays,
  setFoldersWithEssays,
  essaysWithoutFolders,
  setEssaysWithoutFolders,
  createType,
  setCreateType,
  setShowInputModal,
  setCurrDocument,
  input,
  setInput,
  setDefaultTextHTML,
}: DrawerProps) {
  const ROOT_MENU_ID = "root_menu_id";
  const FOLDER_MENU_ID = "folder_menu_id";
  const DOCUMENT_MENU_ID = "document_menu_id";

  const [currFolderData, setCurrFolderData] = useState<Record<string, any>>({});

  const { show } = useContextMenu({
    id: ROOT_MENU_ID,
  });

  const handleShowMenu = (
    event: React.MouseEvent,
    id: string,
    data: Record<string, any> = {},
  ) => {
    event.stopPropagation();

    show({
      event,
      id,
      props: {
        ...data,
      },
    });
  };

  /**
   * Folder Item
   * @param param0
   * @returns
   */
  const FolderItem = ({ folderData }: { folderData?: Record<string, any> }) => {
    return (
      <div
        className="mt-5 mr-4 flex flex-row items-end justify-between"
        onContextMenu={(e) => handleShowMenu(e, FOLDER_MENU_ID, folderData)}
      >
        <div className="flex flex-row items-end">
          <Image src="/images/folder.svg" height={20} width={25} alt="logo" />
          <span className="ml-3" style={{ fontSize: "16px" }}>
            {folderData?.folderName}
          </span>
        </div>
        <div className="flex flex-row items-end">
          <FaPlus
            height={12}
            width={12}
            className="cursor-pointer text-gray-400"
            onClick={() =>
              openDocumentUnderFolderInput(folderData ? folderData : {})
            }
          />
        </div>
      </div>
    );
  };

  /**
   * Document Item
   * @param param0
   * @returns
   */
  const DocumentItem = ({
    indented,
    documentData,
    lastItem,
  }: {
    indented: boolean;
    documentData?: Record<string, any>;
    lastItem: boolean;
  }) => {
    const handleOpenDocument = () => {
      openDocument(documentData ? documentData : {});
      closeDrawer();
    };
    return (
      <div
        className={`mt-3 ${
          indented ? "pl-6" : ""
        } flex cursor-pointer flex-row items-center justify-between ${lastItem ? "mb-12" : ""}`}
        onContextMenu={(e) =>
          handleShowMenu(e, DOCUMENT_MENU_ID, { indented, ...documentData })
        }
        onClick={handleOpenDocument}
      >
        <div className="flex flex-row justify-between">
          <Image src="/images/text.svg" height={20} width={25} alt="logo" />
          <span className="ml-3" style={{ fontSize: "16px" }}>
            {documentData?.essayName}
          </span>
        </div>
      </div>
    );
  };

  const closeDrawerIfMobile = () => {
    closeDrawer();
  };

  /**
   * Opens input modal
   */
  const openFolderInput = () => {
    closeDrawerIfMobile();
    setCreateType("folder");
    setShowInputModal(true);
  };

  /**
   * Opens input modal
   */
  const openDocumentUnderFolderInput = (folderData: Record<string, any>) => {
    closeDrawerIfMobile();
    setCreateType("document-under-folder");
    setCurrFolderData(folderData);
    setShowInputModal(true);
  };

  /**
   * Opens input modal
   */
  const openRootDocumentInput = () => {
    closeDrawerIfMobile();
    setCreateType("root-document");
    setShowInputModal(true);
  };

  const createFolder = (folderName: string) => {
    const newFoldersWithEssays = { ...foldersWithEssays };

    // Make post request to create folder on backend
    makePostRequest(`${SECOND_BACKEND_URL}/api/writing/storage/create-folder`, {
      folderName: folderName,
    }).then((res) => {
      const newFolderData = res.data;
      newFoldersWithEssays[res.data._id] = { ...newFolderData, essays: [] };
      setFoldersWithEssays(newFoldersWithEssays);
    });
  };

  useEffect(() => {
    if (createType && createType.length > 0 && input && input.length > 0) {
      handleInput(input);
      setCreateType("");
      setInput("");
    }
  }, [createType, input]);

  const handleInput = (input: string) => {
    if (createType === "folder") {
      createFolder(input);
    } else if (createType === "document-under-folder") {
      const { _id } = currFolderData;
      const essayData = {
        userId: "",
        folderId: _id,
        essayName: input,
        essayContent: "",
      };

      // Update the foldersWithEssays map with new essay
      const newFoldersWithEssays = { ...foldersWithEssays };
      newFoldersWithEssays[_id].essays.push(essayData);
      setFoldersWithEssays(newFoldersWithEssays);

      // Make post request to create document under folder on backend
      makePostRequest(
        `${SECOND_BACKEND_URL}/api/writing/storage/create-essay`,
        { essayName: input, folderId: _id, essayContent: "" },
      );
    } else if (createType === "root-document") {
      createDocumentAtRoot(input);
    }
  };

  const createDocumentAtRoot = (documentName: string) => {
    makePostRequest(`${SECOND_BACKEND_URL}/api/writing/storage/create-essay`, {
      essayName: documentName,
      essayContent: "",
    }).then((res) => {
      const newDoc = res.data;
      setCurrDocument(newDoc);
      setDefaultTextHTML("<p></p>");
      setEssaysWithoutFolders([...essaysWithoutFolders, newDoc]);
    });
  };

  const deleteFolder = (folderData: Record<string, any>) => {
    const { _id, essays } = folderData;
    const newFoldersWithEssays = { ...foldersWithEssays };
    delete newFoldersWithEssays[_id];
    setFoldersWithEssays(newFoldersWithEssays);

    makePostRequest(`${SECOND_BACKEND_URL}/api/writing/storage/delete-folder`, {
      _id,
      essays,
    });
  };

  const deleteDocument = (documentData: Record<string, any>) => {
    const { indented, _id, folderId } = documentData;

    // if indented, then delete from folder
    if (indented) {
      const newFoldersWithEssays = { ...foldersWithEssays };
      const newEssays = newFoldersWithEssays[folderId].essays.filter(
        (essay: Record<string, any>) => essay._id !== _id,
      );
      newFoldersWithEssays[folderId].essays = newEssays;
      setFoldersWithEssays(newFoldersWithEssays);
    } else {
      // delete from essaysWithoutFolders
      const newEssaysWithoutFolders = essaysWithoutFolders.filter(
        (essay) => essay._id !== _id,
      );
      setEssaysWithoutFolders(newEssaysWithoutFolders);
    }

    makePostRequest(`${SECOND_BACKEND_URL}/api/writing/storage/delete-essay`, {
      _id,
    });
  };

  return (
    <main
      className={
        " fixed inset-0 z-50 transform overflow-hidden bg-gray-900 bg-opacity-25 ease-in-out " +
        (isOpen
          ? " translate-x-0 opacity-100 transition-opacity duration-500  "
          : " delay-25 hideDrawer opacity-0 transition-opacity  ")
      }
    >
      <Menu id={ROOT_MENU_ID}>
        <Item onClick={() => openFolderInput()}>Create Folder</Item>
        <Separator />
        <Item onClick={() => openRootDocumentInput()}>Create Document</Item>
      </Menu>

      <Menu id={FOLDER_MENU_ID}>
        <Item onClick={({ props }) => openDocumentUnderFolderInput(props)}>
          Create Document
        </Item>
        <Separator />
        <Item onClick={({ props }) => deleteFolder(props)}>
          <p className="text-red-500">Delete Folder</p>
        </Item>
      </Menu>

      <Menu id={DOCUMENT_MENU_ID}>
        <Item onClick={({ props }) => deleteDocument(props)}>
          <p className="text-red-500">Delete Document</p>
        </Item>
      </Menu>

      <section
        className={
          " delay-400 absolute left-0 h-full w-screen max-w-xs transform bg-white shadow-xl transition-all duration-500 ease-in-out " +
          (isOpen ? " translate-x-0 " : " hideDrawer ")
        }
        onContextMenu={(e) => handleShowMenu(e, ROOT_MENU_ID)}
      >
        <div
          className="relative flex h-full w-screen max-w-xs flex-col space-y-6 p-5 pr-7"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          <Image src="/ConchLogo.png" height={100} width={150} alt="logo" />
          <div className="mt-7 pl-3">
            <div
              className="flex w-full cursor-pointer items-center justify-center bg-black text-center text-white"
              style={{
                height: "37px",
                lineHeight: "1.7",
                fontSize: "16px",
                borderRadius: "12px",
                fontWeight: 500,
              }}
              onClick={() => openRootDocumentInput()}
            >
              New Document
            </div>
            <div
              className="mt-2 flex w-full cursor-pointer items-center justify-center bg-gray-500 text-center text-white"
              style={{
                height: "37px",
                lineHeight: "1.7",
                fontSize: "16px",
                borderRadius: "12px",
                fontWeight: 500,
              }}
              onClick={() => openFolderInput()}
            >
              New Folder
            </div>
            <div
              className="mt-2 w-full overflow-y-auto pb-5"
              style={{ minHeight: "80vh", maxHeight: "80vh" }}
            >
              {
                /* Iterate over key-value dictionary foldersWithEssays */
                foldersWithEssays &&
                  Object.keys(foldersWithEssays).map((_id) => {
                    const folderData = foldersWithEssays[_id];
                    return (
                      <div className="w-full" key={_id}>
                        <FolderItem folderData={folderData} />
                        {folderData &&
                          folderData.essays.map(
                            (document: Record<string, any>, i: number) => {
                              return (
                                <DocumentItem
                                  documentData={document}
                                  indented={true}
                                  key={i}
                                  lastItem={false}
                                />
                              );
                            },
                          )}
                      </div>
                    );
                  })
              }

              {
                /* Iterate over documents without folder */
                essaysWithoutFolders &&
                  essaysWithoutFolders.map((document, i) => {
                    return (
                      <DocumentItem
                        documentData={document}
                        indented={false}
                        key={i}
                        lastItem={i === essaysWithoutFolders.length - 1}
                      />
                    );
                  })
              }
            </div>
          </div>
        </div>
        <Tooltip content="Right click folder or essay to delete. Scroll to see more items below.">
          <div className="drawerQuestionCircle flex w-full items-end justify-end pl-24">
            <FaQuestionCircle size={22} />
          </div>
        </Tooltip>
      </section>
      <section
        className=" h-full w-screen cursor-pointer "
        onClick={closeDrawer}
      ></section>
    </main>
  );
}

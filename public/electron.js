/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *          _   _         _          _            _                   _            _         *
 *         /\_\/\_\ _    /\ \       /\ \         / /\                /\ \         / /\       *
 *        / / / / //\_\ /  \ \      \_\ \       / /  \              /  \ \       / /  \      *
 *       /\ \/ \ \/ / // /\ \ \     /\__ \     / / /\ \            / /\ \ \     / / /\ \__   *
 *      /  \____\__/ // / /\ \_\   / /_ \ \   / / /\ \ \          / / /\ \ \   / / /\ \___\  *
 *     / /\/________// /_/_ \/_/  / / /\ \ \ / / /  \ \ \        / / /  \ \_\  \ \ \ \/___/  *
 *    / / /\/_// / // /____/\    / / /  \/_// / /___/ /\ \      / / /   / / /   \ \ \        *
 *   / / /    / / // /\____\/   / / /      / / /_____/ /\ \    / / /   / / /_    \ \ \       *
 *  / / /    / / // / /______  / / /      / /_________/\ \ \  / / /___/ / //_/\__/ / /       *
 *  \/_/    / / // / /_______\/_/ /      / / /_       __\ \_\/ / /____\/ / \ \/___/ /        *
 *        \/_/ \/__________/\_\/       \_\___\     /____/_/\/_________/   \_____\/           *
 *                                                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *      BY:____________ _____ ___ ___  ________ _____  ___  _     _____ _____ _____          *
 *        |  _  \ ___ \  ___/ _ \|  \/  /  ___/  __ \/ _ \| |   |  ___|_   _|  _  |          *
 *        | | | | |_/ / |__/ /_\ \ .  . \ `--.| /  \/ /_\ \ |   | |__   | | | | | |          *
 *        | | | |    /|  __|  _  | |\/| |`--. \ |   |  _  | |   |  __|  | | | | | |          *
 *        | |/ /| |\ \| |__| | | | |  | /\__/ / \__/\ | | | |___| |_____| |_\ \_/ / 1-14x0r  *
 *        |___/ \_| \_\____|_| |_|_|  |_|____/ \____|_| |_|_____|____(_)___/ \___/  OCT.2017 *
 *                                                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                           *
 *   This document is a part of the source code and related artifacts                        *
 *   for MetaOS owned by DreamScale Inc.:                                                    *
 *                                                                                           *
 *   http://dreamscale.io                                                                    *
 *                                                                                           *
 *   Copyright © 2017 Dreamscale Inc.                                                        *
 *                                                                                           *
 *   Licensed under the GNU LESSER GENERAL PUBLIC LICENSE (LGPL), Version 3.0.               *
 *   You may not use this file except in compliance with this License, the                   *
 *   license file provided by DreamScale Inc (included in this distribution),                *
 *   and the DreamScale End User License Agreement (EULA) that was agreed upon               *
 *   downloading this software file.                                                         *
 *                                                                                           *
 *   You may obtain a copy of the LGPL 3.0 License at:                                       *
 *   https://www.gnu.org/licenses/lgpl-3.0.en.html                                           *
 *                                                                                           *
 *   You may obtain a copy of the DreamScale.io License and EULA at:                         *
 *   https://dreamscale.io/licenses/metaos-license.txt                                       *
 *   https://dreamscale.io/licenses/metaos-eula.txt                                          *
 *                                                                                           *
 *   Unless required by applicable law or agreed to in writing, software                     *
 *   distributed under the License is distributed on an "AS IS" BASIS,                       *
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                *
 *   See the License for the specific language governing permissions and                     *
 *   limitations under the license.                                                          *
 *                                                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const App = require("./App");

function main() {
  try {
    global.App = new App();
  } catch (error) {
    App.handleError(error, true);
  }
}

main();
